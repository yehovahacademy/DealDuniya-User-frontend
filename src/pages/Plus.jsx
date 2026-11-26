import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Offers.css";

const TEASERS = [
  { icon: "🪙", title: "Coins on every order", text: "Earn DealDuniya coins each time you shop." },
  { icon: "🎟️", title: "Free membership", text: "No fees. Join once Plus launches." },
  { icon: "⚡", title: "Early access", text: "Be first in line for deals and new arrivals." },
];

export default function Plus() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="of">
      <div className="of-hero">
        <span className="of-tag" aria-hidden="true">+</span>
        <small className="of-chip">Coming soon</small>
        <h1>DealDuniya Plus</h1>
        <p>Our free membership is almost here. Check back soon. Meanwhile, there's plenty to explore.</p>
        <div className="of-cta">
          <Link to="/products" className="btn">Browse products</Link>
          <Link to="/home" className="pill">Back to home</Link>
        </div>
      </div>

      <div className="of-grid">
        {TEASERS.map((t) => (
          <div key={t.title} className="of-card">
            <i aria-hidden="true">{t.icon}</i>
            <b>{t.title}</b>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
