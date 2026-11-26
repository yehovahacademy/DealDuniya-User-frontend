import api from "./api.js";

// POST /api/orders { addressId, paymentMethod: "COD" | "ONLINE" }
// The server builds the order from the user's cart, re-checks stock and price,
// copies the address onto the order, deducts stock and empties the cart.
// 201 -> { success, data: Order & { items: OrderItem[] } }
export const placeOrder = ({ addressId, paymentMethod }) =>
  api.post("/orders", { addressId, paymentMethod }).then((r) => r.data.data);

// True when the route itself doesn't exist (Express's default 404 page, not a JSON error).
export const isMissingRoute = (err) =>
  err?.response?.status === 404 && typeof err.response.data?.success !== "boolean";
