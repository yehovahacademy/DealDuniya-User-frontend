import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../pages/Offers.css";

// Shared "coming soon" page layout (used by Plus and Minutes).
export default function ComingSoon({ badge, title, text, teasers }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="of">
      <div className="of-hero">
        <span className="of-tag" aria-hidden="true">{badge}</span>
        <small className="of-chip">Coming soon</small>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="of-cta">
          <Link to="/products" className="btn">Browse products</Link>
          <Link to="/home" className="pill">Back to home</Link>
        </div>
      </div>

      <div className="of-grid">
        {teasers.map((t) => (
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
