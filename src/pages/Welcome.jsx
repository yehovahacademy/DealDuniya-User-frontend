import ThemeToggle from "../components/ThemeToggle.jsx";
import Logo from "../components/Logo.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTypewriter, TypeOnce, useInView, Reveal, CountUp } from "../utils/motion.jsx";
import { Link } from "react-router-dom";
import { useStore } from "../context/CartContext.jsx";
import useAuth from "../hooks/useAuth.js";
import "./Welcome.css";

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ---------- Content ---------- */

const WORDS = ["gadgets.", "fashion.", "groceries.", "home decor.", "beauty.", "everything."];

const FEATURES = [
  { icon: "⚡", title: "Fast delivery", text: "Next-day delivery on thousands of products, tracked from our door to yours." },
  { icon: "🛡️", title: "Secure checkout", text: "Your account and payments are protected end to end. Pay online or on delivery." },
  { icon: "↩️", title: "Easy returns", text: "Changed your mind? Return most items within 7 days, no questions asked." },
  { icon: "✨", title: "Curated catalog", text: "From smartphones to skincare, every product is checked before it is listed." },
];

const STEPS = [
  { n: "01", title: "Discover", text: "Browse categories or search for exactly what you need." },
  { n: "02", title: "Add to bag", text: "Save favourites to your wishlist and fill your bag in one tap." },
  { n: "03", title: "Check out", text: "Pick an address, choose how to pay and you're done." },
];

/* ---------- Page ---------- */

export default function Welcome() {
  const { products } = useStore();
  const { user } = useAuth();
  const typed = useTypewriter(WORDS);
  const rootRef = useRef();
  const [scrolled, setScrolled] = useState(false);

  // Scroll progress bar + hero parallax, written straight to CSS variables (no re-render per frame).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = rootRef.current;
        if (!el) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        el.style.setProperty("--progress", max > 0 ? window.scrollY / max : 0);
        el.style.setProperty("--sy", Math.min(window.scrollY, 900));
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const inStock = useMemo(() => products.filter((p) => p.stock > 0 && p.image), [products]);

  // One product per category for the hero collage and category grid.
  const perCategory = useMemo(() => {
    const seen = new Map();
    inStock.forEach((p) => !seen.has(p.category) && seen.set(p.category, p));
    return [...seen.values()];
  }, [inStock]);

  const heroCards = perCategory.slice(0, 4);
  const categoryCount = new Set(products.map((p) => p.category)).size;
  const showcase = inStock.filter((_, i) => i % 3 === 0).slice(0, 14);

  return (
    <div className="intro" ref={rootRef}>
      <div className="intro-progress" />

      {/* Nav */}
      <nav className={`intro-nav ${scrolled ? "solid" : ""}`}>
        <div className="intro-w intro-nav-in">
          <Link to="/" className="intro-brand" aria-label="DealDuniya"><Logo size={32} /></Link>
          <div className="intro-links">
            <button onClick={() => scrollTo("features")}>Why DealDuniya</button>
            <button onClick={() => scrollTo("categories")}>Categories</button>
            <button onClick={() => scrollTo("how")}>How it works</button>
          </div>
          <ThemeToggle className="intro-theme" />
          <Link to="/home" className="intro-btn sm">Start shopping</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="intro-hero">
        <div className="intro-blob b1" />
        <div className="intro-blob b2" />
        <div className="intro-blob b3" />
        <div className="intro-grid-bg" />

        <div className="intro-w intro-hero-in">
          <div className="intro-hero-copy">
            <span className="intro-chip intro-fade" style={{ "--d": "0ms" }}>
              <i /> {products.length ? `${products.length} products live now` : "Now open"}
            </span>
            <h1 className="intro-fade" style={{ "--d": "120ms" }}>
              One store for
              <br />
              <span className="intro-typed">{typed}</span>
              <span className="intro-caret" aria-hidden="true" />
            </h1>
            <p className="intro-fade" style={{ "--d": "240ms" }}>
              DealDuniya brings phones, fashion, home, groceries and more into one place, with honest prices and fast delivery.
            </p>
            <div className="intro-cta intro-fade" style={{ "--d": "360ms" }}>
              <Link to="/home" className="intro-btn">Start shopping →</Link>
              {user ? (
                <Link to="/products" className="intro-btn ghost">Browse products</Link>
              ) : (
                <Link to="/login" className="intro-btn ghost">Create an account</Link>
              )}
            </div>
          </div>

          <div className="intro-collage" aria-hidden="true">
            {heroCards.map((p, i) => (
              <Link key={p.id} to={`/products?category=${encodeURIComponent(p.category)}`} className={`intro-float f${i}`} tabIndex={-1}>
                <img src={p.image} alt="" />
                <span>{p.category}</span>
              </Link>
            ))}
            <div className="intro-ring" />
          </div>
        </div>

        <button className="intro-scroll" onClick={() => scrollTo("stats")} aria-label="Scroll down">
          <span />
        </button>
      </div>

      {/* Category marquee */}
      <div className="intro-marquee" aria-hidden="true">
        <div className="intro-marquee-track">
          {[0, 1].map((k) => (
            <div key={k}>
              {(perCategory.length ? perCategory.map((p) => p.category) : ["Electronics", "Fashion", "Home", "Beauty", "Groceries", "Sports"]).map((c) => (
                <span key={c + k}>{c} <em>✦</em></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section id="stats" className="intro-w intro-stats">
        {[
          { to: products.length || 200, suffix: "+", label: "Products to explore" },
          { to: categoryCount || 25, suffix: "", label: "Categories" },
          { to: 24, suffix: "h", label: "Dispatch on most orders" },
          { to: 7, suffix: "-day", label: "Easy returns" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 90} className="intro-stat">
            <CountUp to={s.to} suffix={s.suffix} />
            <span>{s.label}</span>
          </Reveal>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="intro-w intro-sec">
        <Reveal className="intro-head">
          <small>Why DealDuniya</small>
          <h2><TypeOnce text="Shopping that just works." /></h2>
          <p>Everything you expect from a modern store, without the clutter.</p>
        </Reveal>
        <div className="intro-features">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 110} className="intro-feature">
              <i>{f.icon}</i>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="intro-sec">
        <div className="intro-w">
          <Reveal className="intro-head">
            <small>Categories</small>
            <h2><TypeOnce text="Find your next favourite." /></h2>
            <p>Pick a category to jump straight into the catalog.</p>
          </Reveal>
          <div className="intro-cats">
            {perCategory.slice(0, 8).map((p, i) => (
              <Reveal key={p.category} delay={(i % 4) * 90} from="zoom">
                <Link to={`/products?category=${encodeURIComponent(p.category)}`} className="intro-cat">
                  <div><img src={p.image} alt="" loading="lazy" /></div>
                  <b>{p.category}</b>
                  <span>Shop now →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {showcase.length > 0 && (
          <div className="intro-showcase" aria-hidden="true">
            <div className="intro-showcase-track">
              {[...showcase, ...showcase].map((p, i) => (
                <div key={p.id + i} className="intro-shot"><img src={p.image} alt="" loading="lazy" /></div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* How it works */}
      <section id="how" className="intro-w intro-sec">
        <Reveal className="intro-head">
          <small>How it works</small>
          <h2><TypeOnce text="From browse to doorstep in three steps." /></h2>
        </Reveal>
        <HowSteps />
      </section>

      {/* CTA */}
      <section className="intro-w intro-sec">
        <Reveal from="zoom" className="intro-final">
          <div className="intro-blob b1" />
          <div className="intro-blob b2" />
          <h2>Ready when you are.</h2>
          <p>Thousands of products, one bag. Start exploring DealDuniya today.</p>
          <div className="intro-cta center">
            <Link to="/home" className="intro-btn light">Start shopping</Link>
            {!user && <Link to="/login" className="intro-btn ghost light">Sign up free</Link>}
          </div>
        </Reveal>
      </section>

      <div className="intro-foot intro-w">
        <Logo size={26} />
        <span>© 2026 DealDuniya</span>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top ↑</button>
      </div>
    </div>
  );
}

function HowSteps() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <div ref={ref} className={`intro-steps ${inView ? "in" : ""}`}>
      <div className="intro-line"><span /></div>
      {STEPS.map((s, i) => (
        <div key={s.n} className="intro-step" style={{ "--d": `${300 + i * 350}ms` }}>
          <em>{s.n}</em>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  );
}
