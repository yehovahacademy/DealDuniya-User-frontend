import CountBadge from "../components/CountBadge.jsx";
import { useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Drawer from "../components/Drawer.jsx";
import { useStore } from "../context/CartContext.jsx";

export default function UserLayout() {
  const { openDrawer, comingSoon, toastMsg, toastOn, cartCount, wishlist } = useStore();
  const searchRef = useRef();
  const navigate = useNavigate();

  return (
    <>
      <Header searchRef={searchRef} />
      <main className="w">
        <Outlet />
      </main>
      <Footer />

      <div className="bnv">
        <button onClick={() => { navigate("/home"); window.scrollTo(0, 0); }}><i>⌂</i>Home</button>
        <button onClick={() => navigate("/products")}><i>▦</i>Products</button>
        <button onClick={(e) => { e.stopPropagation(); searchRef.current?.focus(); }}><i>⌕</i>Search</button>
        <button onClick={() => openDrawer("wishlist")}><i>♡<CountBadge count={wishlist.length} /></i>Wishlist</button>
        <button onClick={() => openDrawer("cart")}><i>👜<CountBadge count={cartCount} /></i>Bag</button>
      </div>

      <Drawer />
      <div className={`toast ${toastOn ? "on" : ""}`}>{toastMsg}</div>
    </>
  );
}
