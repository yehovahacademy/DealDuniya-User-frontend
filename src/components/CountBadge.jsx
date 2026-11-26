// Small count bubble for the bag / wishlist icons. Hidden at 0, capped at "99+",
// and re-keyed on change so it pops whenever the number updates.
export default function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span key={count} className="badge" aria-hidden="true">
      {count > 99 ? "99+" : count}
    </span>
  );
}
