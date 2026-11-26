import api from "./api.js";

// Address API (backend: routes/addressRoutes.js, controllers/addressControllers.js).
// POST /api/orders needs the id of one of these addresses.
//   GET    /api/addresses              -> { success, count, addresses: Address[] }   (newest first)
//   POST   /api/addresses              body { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault }
//                                      -> 201 { success, message, address }
//   PATCH  /api/addresses/:addressId   body: any of the fields above -> { success, message, address }
//                                      (isDefault: true clears it on the user's other addresses)
//   DELETE /api/addresses/:addressId   -> { success, message }
export const getAddresses = () => api.get("/addresses").then((r) => r.data.addresses || []);
export const createAddress = (address) => api.post("/addresses", address).then((r) => r.data.address);
export const updateAddress = (id, changes) => api.patch(`/addresses/${id}`, changes).then((r) => r.data.address);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);
