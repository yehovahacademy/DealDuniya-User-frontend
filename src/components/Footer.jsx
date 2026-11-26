import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
export default function Footer() {
  return (
    <footer>
      <div className="w">
        <div className="fg">
          <div>
            <div className="logo" style={{ marginBottom: 10 }}><Logo size={28} /></div>
            India’s marketplace for everyday and premium shopping.
            <br />
            Instagram · X · YouTube · LinkedIn
          </div>
          <div>
            <h5>Company</h5>
            <Link to="/about">About us</Link>
            <a>Seller registration</a>
          </div>
          <div>
            <h5>Support</h5>
            <Link to="/contact">Customer support</Link>
            <a>FAQs</a>
            <a>Shipping information</a>
            <a>Return &amp; refund policy</a>
          </div>
          <div>
            <h5>Legal</h5>
            <a>Privacy policy</a>
            <a>Terms &amp; conditions</a>
          </div>
        </div>
        <p style={{ marginTop: 22 }}>© 2026 DealDuniya. Prototype with sample data.</p>
      </div>
    </footer>
  );
}
