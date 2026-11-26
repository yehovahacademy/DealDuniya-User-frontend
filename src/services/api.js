import axios from "axios";

export const TOKEN_KEY = "token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Pull the backend's { message } out of an axios error.
export const errorMessage = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message || fallback;

export default api;
