// Bag pricing shown in the UI. Must match createOrder in the backend, which is the
// source of truth: it currently charges no shipping (shippingFee = 0).
export const FREE_DELIVERY_FROM = 0;
export const DELIVERY_FEE = 0;

export function bagTotals(items) {
  const mrp = items.reduce((s, { p, qty }) => s + p.mrp * qty, 0);
  const subtotal = items.reduce((s, { p, qty }) => s + p.price * qty, 0);
  const shippingFee = subtotal > 0 && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
  return { mrp, subtotal, discount: mrp - subtotal, shippingFee, total: subtotal + shippingFee };
}
