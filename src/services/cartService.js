import api from "./api.js";

// All cart routes need the Bearer token (added by the api interceptor).
// The backend identifies cart lines by CartItem id, not product id.

// GET /api/cart -> { items: [{ id, productId, quantity, product }] }
export const getCart = () => api.get("/cart").then((r) => r.data.data);

// POST /api/cart { productId, quantity } -> CartItem (quantity is the new total)
export const addItem = (productId, quantity = 1) =>
  api.post("/cart", { productId, quantity }).then((r) => r.data.data);

// PATCH /api/cart/:itemId { quantity } -> CartItem
export const updateItem = (itemId, quantity) =>
  api.patch(`/cart/${itemId}`, { quantity }).then((r) => r.data.data);

// DELETE /api/cart/:itemId
export const removeItem = (itemId) => api.delete(`/cart/${itemId}`);

// DELETE /api/cart
export const clearCart = () => api.delete("/cart");
