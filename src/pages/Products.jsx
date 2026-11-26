import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useStore } from "../context/CartContext.jsx";

const PAGE = 24;

const SORTS = {
  relevance: { label: "Relevance", fn: null },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  name: { label: "Name: A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
};

export default function Products() {
  const { products, productsStatus } = useStore();
  const [params, setParams] = useSearchParams();

  // Filters live in the URL (/products?category=electronics&q=bag&sort=price-asc)
  // so they survive refresh and can be linked to.
  const category = params.get("category") || "All";
  const q = params.get("q") || "";
  const sort = SORTS[params.get("sort")] ? params.get("sort") : "relevance";

  const update = (key, value, empty) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (!value || value === empty) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true }
    );

  const categories = useMemo(() => {
    const counts = new Map();
    products.forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [products]);

  const shown = useMemo(() => {
    const v = q.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!v || `${p.name} ${p.brand} ${p.category} ${p.description || ""}`.toLowerCase().includes(v))
    );
    const sorted = SORTS[sort].fn ? [...list].sort(SORTS[sort].fn) : list;
    return sorted.sort((a, b) => (a.stock === 0) - (b.stock === 0)); // sold out last (stable)
  }, [products, category, q, sort]);

  // Render in pages of 24; start over whenever the filters change.
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [category, q, sort]);

  const hasFilters = category !== "All" || q;

  return (
    <section className="plp">
      <div className="sh">
        <h2>{category === "All" ? "All products" : category}</h2>
        {productsStatus === "ready" && <span className="plp-count">{shown.length} of {products.length} items</span>}
      </div>

      <div className="plp-bar">
        <div className="plp-search">
          <span>⌕</span>
          <input
            type="search"
            value={q}
            placeholder="Filter products"
            aria-label="Filter products"
            onChange={(e) => update("q", e.target.value, "")}
          />
        </div>
        <label className="plp-sort">
          Sort
          <select value={sort} onChange={(e) => update("sort", e.target.value, "relevance")}>
            {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <div className="nv">
        <button className={`pill ${category === "All" ? "on" : ""}`} onClick={() => update("category", "", "All")}>
          All <small>{products.length}</small>
        </button>
        {categories.map(([name, count]) => (
          <button key={name} className={`pill ${name === category ? "on" : ""}`} onClick={() => update("category", name, "All")}>
            {name} <small>{count}</small>
          </button>
        ))}
      </div>

      {productsStatus === "loading" ? (
        <p className="empty">Loading products…</p>
      ) : productsStatus === "error" ? (
        <p className="empty">Couldn't load products. Is the backend running on port 5000?</p>
      ) : shown.length ? (
        <>
          <div className="grid">
            {shown.slice(0, limit).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {shown.length > limit && (
            <div className="plp-more">
              <button className="pill" onClick={() => setLimit((l) => l + PAGE)}>
                Show more ({shown.length - limit} left)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="plp-none">
          <p className="empty">No products match {q ? `“${q}”` : "this filter"}.</p>
          {hasFilters && <button className="btn" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
        </div>
      )}
    </section>
  );
}
