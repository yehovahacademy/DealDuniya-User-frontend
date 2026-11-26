import api from "./api.js";

// POST /api/contact { name, email, topic, orderNumber?, message }
// Not in the backend yet. Until it exists, the request 404s and
// orderService.isMissingRoute(err) is true, which the Contact page reports honestly.
// Expected 201 -> { success, message }
export const sendMessage = (body) => api.post("/contact", body).then((r) => r.data);
