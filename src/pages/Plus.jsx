import ComingSoon from "../components/ComingSoon.jsx";

const TEASERS = [
  { icon: "🪙", title: "Coins on every order", text: "Earn DealDuniya coins each time you shop." },
  { icon: "🎟️", title: "Free membership", text: "No fees. Join once Plus launches." },
  { icon: "⚡", title: "Early access", text: "Be first in line for deals and new arrivals." },
];

export default function Plus() {
  return (
    <ComingSoon
      badge="+"
      title="DealDuniya Plus"
      text="Our free membership is almost here. Check back soon. Meanwhile, there's plenty to explore."
      teasers={TEASERS}
    />
  );
}
