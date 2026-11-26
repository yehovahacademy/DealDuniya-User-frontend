import { Link } from "react-router-dom";
import SiteNav from "../components/SiteNav.jsx";
import { useStore } from "../context/CartContext.jsx";
import { useTypewriter, useInView, Reveal, CountUp } from "../utils/motion.jsx";
import "./Welcome.css"; // shared .intro-* building blocks (buttons, chip, blobs, caret, reveal)
import "./About.css";

const WORDS = ["honest prices.", "fast delivery.", "easy returns.", "everything you need."];

const Icon = {
  tag: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </svg>
  ),
  returns: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3" />
      <path d="M18 3v4h-4M6 21v-4h4" />
    </svg>
  ),
};

const VALUES = [
  { icon: Icon.tag, title: "Honest prices", text: "No hidden fees at checkout. What you see on the card is what you pay." },
  { icon: Icon.truck, title: "Fast delivery", text: "Orders are packed quickly and tracked all the way to your door." },
  { icon: Icon.returns, title: "Easy returns", text: "Changed your mind? Return it in a few taps, with no awkward questions." },
];

const STEPS = [
  { title: "Browse", text: "Explore categories or search for exactly what you need." },
  { title: "Add to cart", text: "Compare prices, check ratings and pick your favourites." },
  { title: "Get it delivered", text: "Pay securely and track your order until it arrives." },
];

export default function About() {
  const { products } = useStore();
  const typed = useTypewriter(WORDS);
  const categoryCount = new Set(products.map((p) => p.category)).size;

  return (
    <div className="intro ab">
      <SiteNav />

      {/* Hero */}
      <div className="ab-hero">
        <div className="intro-blob b1" />
        <div className="intro-w ab-hero-in">
          <span className="ab-tag intro-fade" style={{ "--d": "0ms" }}>About us</span>
          {products.length > 0 && (
            <span className="intro-chip ab-live intro-fade" style={{ "--d": "200ms" }}>
              <i /> {products.length} products live now
            </span>
          )}
          <h1 className="intro-fade" style={{ "--d": "100ms" }}>Shopping made simple.</h1>
          <p className="ab-sub intro-fade" style={{ "--d": "180ms" }}>
            We bring you <span className="intro-typed">{typed}</span>
            <span className="intro-caret" aria-hidden="true" />
          </p>
          <p className="ab-lead intro-fade" style={{ "--d": "260ms" }}>
            DealDuniya is one place for everything you need, with honest prices, fast delivery and returns that don’t feel like a chore.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="intro-w ab-sec ab-story">
        <div className="intro-blob b2" />
        <Reveal as="h2">Our story</Reveal>
        <Reveal delay={120} className="ab-story-text">
          <p>
            DealDuniya began with a simple frustration: good deals were scattered across too many tabs, apps and sellers.
            We wanted one store where the price you see is the price you pay.
          </p>
          <p>
            Today we bring phones, fashion, home goods and groceries together, so you can shop once and get on with your day.
          </p>
        </Reveal>
      </section>

      {/* Stats */}
      <section className="intro-w ab-stats">
        {[
          { to: products.length, suffix: "+", label: "Products live now" },
          { to: categoryCount, suffix: "+", label: "Categories to explore" },
          { to: 7, suffix: "-day", label: "Easy returns" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 90} className="ab-card ab-stat">
            <CountUp to={s.to} suffix={s.suffix} />
            <span>{s.label}</span>
          </Reveal>
        ))}
      </section>

      {/* Values */}
      <section className="intro-w ab-sec">
        <Reveal as="h2">What we stand for</Reveal>
        <div className="ab-grid">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 110} className="ab-card ab-value">
              <i>{v.icon}</i>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="intro-w ab-sec">
        <Reveal as="h2">How it works</Reveal>
        <Steps />
      </section>

      {/* CTA */}
      <section className="intro-w ab-sec">
        <Reveal from="zoom" className="ab-cta">
          <h2>Ready to find your deal?</h2>
          <p>Join thousands of shoppers across the duniya.</p>
          <Link to="/home" className="intro-btn sm">Start shopping →</Link>
        </Reveal>
      </section>

      <p className="ab-foot">© 2026 DealDuniya. All rights reserved.</p>

    </div>
  );
}

function Steps() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <ol ref={ref} className={`ab-steps ${inView ? "in" : ""}`}>
      <span className="ab-line" aria-hidden="true"><span /></span>
      {STEPS.map((s, i) => (
        <li key={s.title} style={{ "--d": `${250 + i * 300}ms` }}>
          <em>{i + 1}</em>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
