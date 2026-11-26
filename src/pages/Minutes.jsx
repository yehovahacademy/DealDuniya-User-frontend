import ComingSoon from "../components/ComingSoon.jsx";

const TEASERS = [
  { icon: "⏱️", title: "10-minute delivery", text: "Groceries and essentials at your door in minutes." },
  { icon: "🥬", title: "Fresh every day", text: "Fruits, vegetables, dairy and daily needs." },
  { icon: "🛒", title: "One bag", text: "Shop Minutes from the same DealDuniya account." },
];

export default function Minutes() {
  return (
    <ComingSoon
      badge="⏱"
      title="DealDuniya Minutes"
      text="Groceries and essentials in 10 minutes, launching soon. Meanwhile, there's plenty to explore."
      teasers={TEASERS}
    />
  );
}
