import axios, { type AxiosRequestConfig } from "axios";

// Base instance for our own API (proxied via Vite in dev)
const http = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Request interceptor: attach access token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track if we're already redirecting to avoid infinite loops
let isRedirecting = false;

// Response interceptor: handle 401 with token refresh
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post("/api/auth/refresh", {
            refresh_token: refreshToken,
          });
          localStorage.setItem("access_token", data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return http(originalRequest);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("auth_user");
          if (!isRedirecting) {
            isRedirecting = true;
            window.location.replace("/auth/login");
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

export const apiRequest = async <TData = unknown>(
  config: AxiosRequestConfig,
) => {
  const res = await http.request<TData>(config);
  return res.data;
};

export default http;
