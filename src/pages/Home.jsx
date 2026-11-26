import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useStore } from "../context/CartContext.jsx";
import { BRANDS, discount, inr, tint } from "../data/products.js";

function useCountdown(seconds) {
  const [end] = useState(() => Date.now() + seconds * 1000);
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, [end]);
  return [left / 3600, (left / 60) % 60, left % 60].map((n) => String(Math.floor(n)).padStart(2, "0")).join(":");
}

export default function Home() {
  const { products, productsStatus, getProduct, addToCart, viewProduct, comingSoon, category, setCategory, recent, clearRecent } = useStore();
  const timer = useCountdown(5 * 3600 + 42 * 60);
  const carRef = useRef();
  const trendRef = useRef();

  // Categories come from the products themselves: the 10 biggest, each tile showing its first product's image.
  const inStock = products.filter((p) => p.stock > 0);
  const categories = Object.values(
    inStock.reduce((acc, p) => {
      acc[p.category] ??= { name: p.category, image: p.image, count: 0 };
      acc[p.category].count++;
      return acc;
    }, {})
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const trending = inStock.filter((p) => category === "All" || p.category === category).slice(0, 8);
  const recentProducts = recent.map(getProduct).filter(Boolean).slice(0, 4);
  const heroProduct = inStock[0];
  const dealProduct = inStock[1];
  const popular = inStock.slice(2, 5);

  const scrollCarousel = (dir) =>
    carRef.current?.scrollBy({ left: dir * carRef.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hm">
          <img className="hero-bg" src="/images/p1.jpg" alt="" />
          <div className="hero-copy">
            <small>Shop / Everything</small>
            <h1>Give all you need.</h1>
            <p>Phones, fashion, home and groceries. Honest prices, fast delivery across India.</p>
            <Link to="/products" className="btn">Shop all products</Link>
          </div>
          {heroProduct && (
            <div className="fl">
              <i>{heroProduct.image && <img src={heroProduct.image} alt="" />}</i>
              <div>
                <b>{heroProduct.name}</b>
                <span>{heroProduct.category} · {inr(heroProduct.price)}</span>
              </div>
              <button className="circ" style={{ width: 38, height: 38 }} onClick={() => addToCart(heroProduct.id)}>+</button>
            </div>
          )}
        </div>
        <div className="bt">
          <div className="t photo" onClick={() => comingSoon("Minutes")}>
            <img src="/images/minutes.jpg" alt="" />
            <div><h3>Minutes</h3><p>Groceries and essentials in 10 minutes.</p></div>
            <button className="arr">↗</button>
          </div>
          <div className="t" style={{ background: "var(--sf)" }}>
            <div><h3>DealDuniya Plus</h3><p>Free membership. Earn coins on every order.</p></div>
            <span className="em">🪙</span>
            <button className="arr" onClick={() => comingSoon("Plus")}>↗</button>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="ts">
        {[["🚚", "Same & next-day", "On lakhs of products"], ["💳", "No-cost EMI", "On select cards"], ["↩️", "7-day returns", "Pay on delivery"], ["✓", "Verified sellers", "Genuine products"]].map(
          ([icon, title, sub]) => (
            <div key={title}><i>{icon}</i><div><b>{title}</b><span>{sub}</span></div></div>
          )
        )}
      </div>

      {/* Categories */}
      <section>
        <div className="sh"><h2>Shop by category</h2></div>
        <div className="cats">
          {categories.map((c) => (
            <Link key={c.name} className="cat" to={`/products?category=${encodeURIComponent(c.name)}`}>
              <i>{c.image && <img src={c.image} alt="" loading="lazy" />}</i>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section id="trending" ref={trendRef}>
        <div className="sh"><h2>Trending now</h2><Link to="/products" className="pill">View all</Link></div>
        <div className="nv">
          {["All", ...categories.map((c) => c.name)].map((c) => (
            <button key={c} className={`pill ${c === category ? "on" : ""}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        {productsStatus === "loading" ? (
          <p className="empty">Loading products…</p>
        ) : productsStatus === "error" ? (
          <p className="empty">Couldn't load products. Please refresh in a moment.</p>
        ) : trending.length ? (
          <div className="grid">
            {trending.map((p) => <ProductCard key={p.id} product={p} tag="Trending" />)}
          </div>
        ) : (
          <p className="empty">No products in this category yet.</p>
        )}
      </section>

      {/* Deals */}
      <section>
        <div className="sh"><h2>Best deals<span className="tm">{timer}</span></h2></div>
        <div className="bento">
          <div className="t" style={{ background: "var(--sf)" }}>
            <div><h3>New deals</h3><p>Fresh drops, updated daily.</p></div>
            {dealProduct && (
              <>
                {dealProduct.image && <img className="bento-img" src={dealProduct.image} alt={dealProduct.name} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: 24 }}>{inr(dealProduct.price)}</b>
                  <button className="arr" style={{ margin: 0 }} onClick={() => addToCart(dealProduct.id)}>+</button>
                </div>
              </>
            )}
          </div>
          <div className="t" style={{ background: "var(--sg)" }}>
            <div><h3>Great value deals</h3><p>Find items on sale with 50–75% off.</p></div>
            <img className="bento-img" src="/images/p4.jpg" alt="Oakline sofa" />
            <Link to="/offers" className="btn">75% off · Shop</Link>
          </div>
          <div className="t" style={{ background: "var(--pb)" }}>
            <div><h3>Price match</h3><p>Found it cheaper? We refund the difference.</p></div>
            <span className="em">🏷️</span>
            <button className="arr" onClick={() => comingSoon("Price match")}>↗</button>
          </div>
        </div>
        <div className="pop">
          {popular.map((p) => (
            <div key={p.id} className={`pc ${tint(p)}`} onClick={() => viewProduct(p.id)}>
              {p.image && <img src={p.image} alt="" loading="lazy" />}
              {p.rating != null && <span className="tag">★ {p.rating}</span>}
              <div>
                <span>
                  <b>{p.name}</b><br />
                  <span className="rt">{inr(p.price)}{discount(p) > 0 && ` · ${discount(p)}% off`}</span>
                </span>
                <button onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <div className="sh">
          <h2>Recommended for you</h2>
          <div className="ar">
            <button onClick={() => scrollCarousel(-1)}>←</button>
            <button onClick={() => scrollCarousel(1)}>→</button>
          </div>
        </div>
        <div className="car" ref={carRef}>
          {inStock.slice(8, 18).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Brands */}
      <section>
        <div className="sh"><h2>Featured brands</h2></div>
        <div className="brands">
          {BRANDS.map(([name, sub]) => <div key={name}>{name}<span>{sub}</span></div>)}
        </div>
      </section>

      {/* Recently viewed */}
      {recentProducts.length > 0 && (
        <section>
          <div className="sh">
            <h2>Recently viewed</h2>
            <button className="pill" onClick={clearRecent}>Clear</button>
          </div>
          <div className="grid">
            {recentProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section>
        <div className="cta">
          <h2>Ready to get<br />your new stuff?</h2>
          <div>
            <p>Get early access to deals and Plus perks. No spam, ever.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}

function NewsletterForm() {
  const { toast } = useStore();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        toast("Thanks! You are on the list");
        e.currentTarget.reset();
      }}
    >
      <input type="email" placeholder="Your email" required />
      <button>Send</button>
    </form>
  );
}
