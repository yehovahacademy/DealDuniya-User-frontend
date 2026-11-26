import { forwardRef, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/CartContext.jsx";
import { POPULAR_SEARCHES, inr } from "../data/products.js";

const SearchBar = forwardRef(function SearchBar(_, inputRef) {
  const { products, recentSearches, addRecentSearch, addToCart } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef();

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const submit = (s) => {
    setQuery(s);
    addRecentSearch(s);
    setOpen(false);
    navigate(`/products?q=${encodeURIComponent(s)}`);
  };

  const v = query.trim().toLowerCase();
  const matches = v
    ? products.filter((p) => (p.name + " " + p.brand + " " + p.category).toLowerCase().includes(v)).slice(0, 4)
    : [];
  const matchCats = [...new Set(matches.map((p) => p.category))];

  return (
    <div className="sb" ref={boxRef}>
      <span className="si">⌕</span>
      <input
        ref={inputRef}
        value={query}
        placeholder="Search for products, brands and more"
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => e.key === "Enter" && query && submit(query)}
      />
      <div className={`sg ${open ? "on" : ""}`}>
        {!v ? (
          <>
            <h6>Recent</h6>
            {recentSearches.map((s) => (
              <button key={s} onClick={() => submit(s)}>🕘 {s}</button>
            ))}
            <h6>Popular</h6>
            {POPULAR_SEARCHES.map((s) => (
              <button key={s} onClick={() => submit(s)}>🔥 {s}</button>
            ))}
          </>
        ) : matches.length ? (
          <>
            <h6>Products</h6>
            {matches.map((p) => (
              <button
                key={p.id}
                className="sgp"
                onClick={() => {
                  addToCart(p.id);
                  setOpen(false);
                }}
              >
                {p.image && <img src={p.image} alt="" />}
                {p.name} · {inr(p.price)}
              </button>
            ))}
            <h6>Categories</h6>
            {matchCats.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setOpen(false);
                  navigate(`/products?category=${encodeURIComponent(c)}`);
                }}
              >
                in {c}
              </button>
            ))}
          </>
        ) : (
          <h6>No matches</h6>
        )}
      </div>
    </div>
  );
});

export default SearchBar;
