import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useStore } from "../context/CartContext.jsx";
import { discount, inr, tint } from "../data/products.js";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const {
    products, productsStatus, getProduct, cart, pending,
    addToCart, buyNow, changeQty, wishlist, toggleWishlist, markViewed,
  } = useStore();
  const p = getProduct(id);
  const [active, setActive] = useState(0);

  // New product: reset the gallery, scroll to top and remember it as recently viewed.
  useEffect(() => {
    setActive(0);
    window.scrollTo(0, 0);
  }, [id]);
  useEffect(() => {
    if (p) markViewed(p.id);
  }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const similar = useMemo(
    () => (p ? products.filter((x) => x.category === p.category && x.id !== p.id && x.stock > 0).slice(0, 4) : []),
    [products, p]
  );

  if (!p) {
    return (
      <section className="pd-empty">
        {productsStatus === "loading" ? (
          <p className="empty">Loading product…</p>
        ) : productsStatus === "error" ? (
          <p className="empty">Couldn't load this product. Please try again in a moment.</p>
        ) : (
          <>
            <h2>Product not found</h2>
            <p className="empty">It may have been removed or is no longer available.</p>
            <Link className="btn" to="/products">Browse all products</Link>
          </>
        )}
      </section>
    );
  }

  const images = p.images?.length ? p.images : p.image ? [p.image] : [];
  const soldOut = p.stock === 0;
  const qty = cart[p.id] || 0;
  const busy = !!pending[p.id];
  const liked = wishlist.includes(p.id);
  const off = discount(p);

  return (
    <>
      <nav className="pd-crumbs" aria-label="Breadcrumb">
        <Link to="/products">Products</Link>
        <span>›</span>
        <Link to={`/products?category=${encodeURIComponent(p.category)}`}>{p.category}</Link>
        <span>›</span>
        <b>{p.name}</b>
      </nav>

      <section className="pd">
        <div className="pd-gallery">
          <div className={`pd-main ${tint(p)}`}>
            {images[active] && <img src={images[active]} alt={p.name} />}
            <button className={`wl ${liked ? "on" : ""}`} onClick={() => toggleWishlist(p.id)} aria-label="Wishlist">
              {liked ? "♥" : "♡"}
            </button>
          </div>
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  className={`${tint(p)} ${i === active ? "on" : ""}`}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <small className="pd-cat">{p.category}</small>
          <h1>{p.name}</h1>

          <div className="pd-price">
            <b>{inr(p.price)}</b>
            {p.mrp > p.price && <s>{inr(p.mrp)}</s>}
            {off > 0 && <em>{off}% off</em>}
          </div>
          <p className="pd-tax">Inclusive of all taxes</p>

          <p className={`pd-stock ${soldOut ? "out" : p.stock <= 5 ? "low" : ""}`}>
            {soldOut ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock} left — order soon` : "In stock"}
          </p>

          <div className="pd-actions">
            {qty > 0 ? (
              <div className="pd-qty">
                <button disabled={busy} onClick={() => changeQty(p.id, -1)} aria-label="Decrease quantity">−</button>
                <span>{qty} in bag</span>
                <button disabled={busy || qty >= p.stock} onClick={() => changeQty(p.id, 1)} aria-label="Increase quantity">+</button>
              </div>
            ) : (
              <button className="pd-add" disabled={soldOut || busy} onClick={() => addToCart(p.id)}>
                Add to cart
              </button>
            )}
            <button className="pd-buy" disabled={soldOut || busy} onClick={() => buyNow(p.id)}>Buy now</button>
          </div>

          <ul className="pd-perks">
            <li><i>🚚</i>{p.fast ? "Delivery tomorrow" : "Delivery in 3–4 days"}</li>
            <li><i>💵</i>Cash or UPI on delivery</li>
          </ul>

          {p.description && (
            <div className="pd-desc">
              <h2>About this item</h2>
              <p>{p.description}</p>
            </div>
          )}
        </div>
      </section>

      {similar.length > 0 && (
        <section>
          <div className="sh"><h2>More in {p.category}</h2></div>
          <div className="grid">
            {similar.map((x) => <ProductCard key={x.id} product={x} />)}
          </div>
        </section>
      )}
    </>
  );
}
