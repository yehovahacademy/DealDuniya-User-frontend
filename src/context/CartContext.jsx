import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { errorMessage } from "../services/api.js";
import * as cartService from "../services/cartService.js";
import { getProducts, toUiProduct } from "../services/productService.js";

const CartContext = createContext(null);

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function usePersisted(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue];
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [productsStatus, setProductsStatus] = useState("loading"); // loading | ready | error

  // Server cart, keyed by product id: { [productId]: { itemId, quantity, product } }.
  // The backend is the source of truth; this is only refreshed from its responses.
  const [lines, setLines] = useState({});
  const [cartStatus, setCartStatus] = useState("idle"); // idle | loading | ready | error
  const [pending, setPending] = useState({}); // { [productId]: true } while a request is in flight

  const [wishlist, setWishlist] = usePersisted("wl", []);
  const [recent, setRecent] = usePersisted("rv", []);
  const [recentSearches, setRecentSearches] = usePersisted("rs", ["wireless earbuds", "running shoes"]);
  const [category, setCategory] = useState("All");
  const [drawer, setDrawer] = useState(null); // null | "cart" | "wishlist"
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef();

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setToastOn(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 1700);
  }, []);

  // Products — loaded on start, and re-fetched whenever the tab becomes visible
  // again so admin edits (price, stock, deactivation) show up without a reload.
  const refreshProducts = useRef(() => {});

  useEffect(() => {
    let lastFetch = 0;
    const fetchProducts = () => {
      lastFetch = Date.now();
      getProducts()
        .then((list) => {
          setProducts(list);
          setProductsStatus("ready");
        })
        .catch(() => setProductsStatus((s) => (s === "ready" ? s : "error"))); // keep showing the last good list
    };
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetch > 15000) fetchProducts();
    };
    refreshProducts.current = fetchProducts;
    fetchProducts();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const getProduct = useCallback((id) => byId.get(id), [byId]);

  const toLine = (item) => ({ itemId: item.id, quantity: item.quantity, product: item.product });

  // Cart: load from the server for the signed-in user, clear on logout.
  const loadCart = useCallback(() => {
    setCartStatus("loading");
    return cartService
      .getCart()
      .then((data) => {
        setLines(Object.fromEntries((data?.items || []).map((i) => [i.productId, toLine(i)])));
        setCartStatus("ready");
      })
      .catch(() => setCartStatus("error"));
  }, []);

  useEffect(() => {
    setLines({});
    setPending({});
    if (user) loadCart();
    else setCartStatus("idle");
  }, [user?.id, loadCart]); // eslint-disable-line react-hooks/exhaustive-deps

  const requireLogin = () => {
    if (user) return true;
    toast("Log in to add items to your bag");
    setDrawer(null);
    navigate("/login");
    return false;
  };

  // Runs one cart request per product at a time, so fast double-clicks can't race.
  const withPending = async (id, fn, fallbackMsg) => {
    if (pending[id]) return false;
    setPending((p) => ({ ...p, [id]: true }));
    try {
      await fn();
      return true;
    } catch (err) {
      if (err?.response?.status === 404) loadCart(); // line vanished server-side — resync
      toast(errorMessage(err, fallbackMsg));
      return false;
    } finally {
      setPending(({ [id]: _, ...rest }) => rest);
    }
  };

  const setLine = (id, line) =>
    setLines((l) => {
      const next = { ...l };
      if (line && line.quantity > 0) next[id] = { ...l[id], ...line };
      else delete next[id];
      return next;
    });

  const addToCart = async (id, { silent = false } = {}) => {
    if (!requireLogin()) return false;
    const ok = await withPending(
      id,
      async () => {
        const item = await cartService.addItem(id, 1);
        setLine(id, { itemId: item.id, quantity: item.quantity });
      },
      "Couldn't add to bag"
    );
    if (ok && !silent) toast("Added to bag");
    return ok;
  };

  const buyNow = async (id) => {
    if (await addToCart(id)) setDrawer("cart");
  };

  const removeFromCart = (id) => {
    const line = lines[id];
    if (!line) return;
    return withPending(
      id,
      async () => {
        await cartService.removeItem(line.itemId);
        setLine(id, null);
      },
      "Couldn't remove item"
    );
  };

  const changeQty = (id, delta) => {
    const line = lines[id];
    if (!line || delta > 0) return addToCart(id, { silent: true });
    const nextQty = line.quantity + delta;
    if (nextQty <= 0) return removeFromCart(id);
    return withPending(
      id,
      async () => {
        const item = await cartService.updateItem(line.itemId, nextQty);
        setLine(id, { quantity: item.quantity });
      },
      "Couldn't update quantity"
    );
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setLines({});
    } catch (err) {
      if (err?.response?.status === 404) setLines({}); // backend returns 404 when no cart exists yet
      else toast(errorMessage(err, "Couldn't clear bag"));
    }
  };

  // After a successful order: the backend already emptied the cart in the same
  // transaction, so clear it here at once (no flash of the old bag, and no stale
  // bag if the resync fails), then resync the cart and re-fetch stock levels.
  const orderPlaced = () => {
    setLines({});
    setPending({});
    setDrawer(null);
    loadCart();
    refreshProducts.current();
  };

  // { [productId]: qty } — kept for components that only need quantities.
  const cart = useMemo(() => Object.fromEntries(Object.entries(lines).map(([id, l]) => [id, l.quantity])), [lines]);

  // Lines joined with product data. Prefers the live catalog (has images);
  // falls back to the product the cart API returned (e.g. now inactive).
  const cartItems = useMemo(
    () =>
      Object.entries(lines)
        .map(([id, l]) => ({ p: byId.get(id) || (l.product && toUiProduct(l.product)), qty: l.quantity }))
        .filter((x) => x.p),
    [lines, byId]
  );

  const toggleWishlist = (id) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  const viewProduct = (id) => {
    setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8));
    toast("Product page opens here in the full build");
  };

  const addRecentSearch = (s) => setRecentSearches((r) => [s, ...r.filter((x) => x !== s)].slice(0, 5));

  const comingSoon = (name) => toast(`“${name}” opens in the full build`);

  const cartCount = cartItems.reduce((a, x) => a + x.qty, 0);

  const value = {
    products, productsStatus, getProduct,
    cart, cartItems, cartCount, cartStatus, pending, reloadCart: loadCart, addToCart, buyNow, changeQty, removeFromCart, clearCart, orderPlaced,
    wishlist, toggleWishlist,
    recent, clearRecent: () => setRecent([]), viewProduct,
    recentSearches, addRecentSearch,
    category, setCategory,
    drawer, openDrawer: setDrawer, closeDrawer: () => setDrawer(null),
    toast, toastMsg, toastOn, comingSoon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useStore() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useStore must be used inside <CartProvider>");
  return ctx;
}
