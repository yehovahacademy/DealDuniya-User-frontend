import { useStore } from "../context/CartContext.jsx";
import { discount, inr, tint } from "../data/products.js";

export default function ProductCard({ product: p, tag }) {
  const { wishlist, toggleWishlist, viewProduct, addToCart, buyNow } = useStore();
  const liked = wishlist.includes(p.id);
  const soldOut = p.stock === 0;
  const label = soldOut ? "Sold out" : discount(p) >= 50 ? "Deal" : tag;

  return (
    <div className="card">
      <button className={`wl ${liked ? "on" : ""}`} onClick={() => toggleWishlist(p.id)} aria-label="Wishlist">
        {liked ? "♥" : "♡"}
      </button>
      <div className={`im ${tint(p)}`} onClick={() => viewProduct(p.id)}>
        {p.image && <img src={p.image} alt={p.name} loading="lazy" />}
        {label && <span className={`tag ${label === "Deal" ? "d" : ""}`}>{label}</span>}
      </div>
      <div className="bi">
        <div className="nm">{p.name}</div>
        <div className="sp">
          {p.category} · {soldOut ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock} left` : p.fast ? "Delivery tomorrow" : "3–4 days"}
          {p.rating != null && (
            <> · <span className="rt">★ {p.rating} ({(p.reviews || 0).toLocaleString("en-IN")})</span></>
          )}
        </div>
        <div className="rw">
          <span>
            <b>{inr(p.price)}</b>
            {p.mrp > p.price && <s>{inr(p.mrp)}</s>}
          </span>
          {discount(p) > 0 && <em>{discount(p)}% off</em>}
        </div>
        <div className="bs">
          <button className="ac" disabled={soldOut} onClick={() => addToCart(p.id)}>Add to cart</button>
          <button className="bn2" disabled={soldOut} onClick={() => buyNow(p.id)}>Buy now</button>
        </div>
      </div>
    </div>
  );
}
