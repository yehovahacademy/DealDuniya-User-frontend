import api from "./api.js";

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data); // { token, user }

export const register = (name, email, password) =>
  api.post("/auth/register", { name, email, password }).then((r) => r.data); // { token, user }

export const me = () => api.get("/auth/me").then((r) => r.data.user); // { id, role }
