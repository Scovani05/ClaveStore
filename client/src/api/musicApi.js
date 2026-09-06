import axios from "axios";

let authToken = null;
let unauthorizedHandler = null;

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json"
  }
});

const unwrap = (response) => response.data;

const setAuthToken = (token) => {
  authToken = token || null;

  if (authToken) {
    http.defaults.headers.common.Authorization = `Bearer ${authToken}`;
    return;
  }

  delete http.defaults.headers.common.Authorization;
};

const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === "function" ? handler : null;
};

http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && unauthorizedHandler && !String(error.config?.url || "").startsWith("/auth/")) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  }
);

export const musicApi = {
  setAuthToken,
  setUnauthorizedHandler,
  register: (payload) => http.post("/auth/register", payload).then(unwrap),
  login: (payload) => http.post("/auth/login", payload).then(unwrap),
  getCart: (userId) => http.get(`/carts/${userId}`).then(unwrap),
  saveCart: (userId, items) => http.put(`/carts/${userId}`, { items }).then(unwrap),
  getDashboard: () => http.get("/dashboard").then(unwrap),
  getWorkspace: () => http.get("/workspace").then(unwrap),
  getCategories: () => http.get("/categories").then(unwrap),
  getProducts: (params = {}) => http.get("/products", { params }).then(unwrap),
  createProduct: (payload) => http.post("/products", payload).then(unwrap),
  updateProduct: (id, payload) => http.patch(`/products/${id}`, payload).then(unwrap),
  getOrders: () => http.get("/orders").then(unwrap),
  createOrder: (payload) => http.post("/orders", payload).then(unwrap),
  updateOrder: (id, payload) => http.patch(`/orders/${id}`, payload).then(unwrap),
  getInsight: () => http.get("/insights/music-store").then(unwrap)
};