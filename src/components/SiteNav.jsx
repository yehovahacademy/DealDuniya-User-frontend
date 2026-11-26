import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";

// Top nav for the standalone brand pages (About, Contact).
// Styles: .intro-nav* in pages/Welcome.css, .ab-links / .ab-nav-btn in pages/About.css.
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`intro-nav ${scrolled ? "solid" : ""}`}>
      <div className="intro-w intro-nav-in">
        <Link to="/home" className="intro-brand" aria-label="DealDuniya home"><Logo size={32} /></Link>
        <div className="ab-links">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/products">Categories</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>
        <Link to="/home" className="intro-btn sm ab-nav-btn">Start shopping</Link>
      </div>
    </nav>
  );
}
