import { useNavigate } from "react-router-dom";
import { useStore } from "../context/CartContext.jsx";
import { bagTotals } from "../utils/pricing.js";
import { inr, tint } from "../data/products.js";

export default function Drawer() {
  const {
    drawer, closeDrawer, cartItems, cartStatus, pending, reloadCart, changeQty, removeFromCart, clearCart,
    wishlist, addToCart, getProduct,
  } = useStore();
  const open = drawer !== null;
  const isWishlist = drawer === "wishlist";

  const navigate = useNavigate();
  const { mrp, subtotal: sub, shippingFee: delivery } = bagTotals(cartItems);

  return (
    <>
      <div className={`ov ${open ? "on" : ""}`} onClick={closeDrawer} />
      <aside className={`dr ${open ? "on" : ""}`}>
        <div className="dh">
          <span>{isWishlist ? "Wishlist" : "Your bag"}</span>
          <button className="circ" style={{ width: 36, height: 36 }} onClick={closeDrawer}>✕</button>
        </div>

        <div className="db">
          {isWishlist ? (
            wishlist.length ? (
              wishlist.map(getProduct).filter(Boolean).map((p) => (
                <div className="ci" key={p.id}>
                  <div className={`e ${tint(p)}`}>{p.image && <img src={p.image} alt="" />}</div>
                  <div><b>{p.name}</b><br />{inr(p.price)}</div>
                  <button className="pill" style={{ padding: "8px 14px", background: "var(--bg)" }} onClick={() => addToCart(p.id)}>
                    Add
                  </button>
                </div>
              ))
            ) : (
              <p className="empty">Your wishlist is empty.</p>
            )
          ) : cartStatus === "loading" && !cartItems.length ? (
            <p className="empty">Loading your bag…</p>
          ) : cartStatus === "error" && !cartItems.length ? (
            <p className="empty">
              Couldn't load your bag.{" "}
              <button className="rmv" onClick={reloadCart}>Try again</button>
            </p>
          ) : cartItems.length ? (
            cartItems.map(({ p, qty }) => (
              <div className="ci" key={p.id}>
                <div className={`e ${tint(p)}`}>{p.image && <img src={p.image} alt="" />}</div>
                <div>
                  <b>{p.name}</b><br />
                  {inr(p.price)}<br />
                  <span className="q">
                    <button disabled={pending[p.id]} aria-label="Decrease quantity" onClick={() => changeQty(p.id, -1)}>−</button>
                    <span>{qty}</span>
                    <button disabled={pending[p.id] || qty >= p.stock} aria-label="Increase quantity" onClick={() => changeQty(p.id, 1)}>+</button>
                  </span>
                  <button className="rmv" disabled={pending[p.id]} onClick={() => removeFromCart(p.id)}>Remove</button>
                </div>
              </div>
            ))
          ) : (
            <p className="empty">Your bag is empty.</p>
          )}
        </div>

        {!isWishlist && cartItems.length > 0 && (
          <div className="df">
            <div><span>Price (MRP)</span><span>{inr(mrp)}</span></div>
            <div><span>Discount</span><span style={{ color: "var(--ok)" }}>−{inr(mrp - sub)}</span></div>
            <div><span>Delivery</span><span>{delivery ? inr(delivery) : "Free"}</span></div>
            <div className="tt"><span>Total</span><span>{inr(sub + delivery)}</span></div>
            <button className="btn" style={{ width: "100%", marginTop: 12, padding: 14 }} onClick={() => { closeDrawer(); navigate("/checkout"); }}>
              Proceed to checkout
            </button>
            <button
              className="rmv"
              style={{ display: "block", margin: "10px auto 0" }}
              onClick={() => window.confirm("Remove all items from your bag?") && clearCart()}
            >
              Clear bag
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
