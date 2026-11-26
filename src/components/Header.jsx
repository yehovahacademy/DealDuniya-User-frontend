import ThemeToggle from "./ThemeToggle.jsx";
import CountBadge from "./CountBadge.jsx";
import Logo from "./Logo.jsx";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { useStore } from "../context/CartContext.jsx";
import SearchBar from "./SearchBar.jsx";

export default function Header({ searchRef }) {
  const { cartCount, wishlist, openDrawer, toast } = useStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onAccount = () => {
    if (!user) return navigate("/login");
    if (window.confirm(`Log out of ${user.email}?`)) {
      logout();
      toast("Logged out");
    }
  };

  return (
    <header>
      <div className="w">
        <div className="hd">
          <Link to="/home" className="logo" aria-label="DealDuniya home"><Logo /></Link>
          <SearchBar ref={searchRef} />
          <div className="lk dsk">
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/offers">Offers</NavLink>
          </div>
          <ThemeToggle />
          <button className="ib" aria-label={`Wishlist, ${wishlist.length} ${wishlist.length === 1 ? "item" : "items"}`} onClick={() => openDrawer("wishlist")}>
            ♡<CountBadge count={wishlist.length} />
          </button>
          <button className={`ib dsk ${user ? "me" : ""}`} aria-label="Account" title={user ? "Log out" : "Log in"} onClick={onAccount}>
            {user ? `Hi, ${user.name.split(" ")[0]}` : "☺"}
          </button>
          <button className="ib" aria-label={`Bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`} onClick={() => openDrawer("cart")}>
            👜<CountBadge count={cartCount} />
          </button>
        </div>
      </div>
    </header>
  );
}
