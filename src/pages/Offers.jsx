import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Offers.css";

const TEASERS = [
  { icon: "⚡", title: "Lightning deals", text: "Limited-time prices that drop every few hours." },
  { icon: "🏷️", title: "Bank offers", text: "Instant discounts and no-cost EMI on popular cards." },
  { icon: "🪙", title: "Plus rewards", text: "Extra coins and early access for DealDuniya Plus members." },
];

export default function Offers() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="of">
      <div className="of-hero">
        <span className="of-tag" aria-hidden="true">%</span>
        <small className="of-chip">Coming soon</small>
        <h1>Offers are on their way</h1>
        <p>We're lining up the best deals across DealDuniya. Check back soon. Meanwhile, there's plenty to explore.</p>
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
