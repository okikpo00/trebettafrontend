// src/api.js
import axios from "axios";

const API_BASE_URL = "https://api.trebetta.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // refresh token cookie flows rely on this
});

// ====== REQUEST INTERCEPTOR (ADD TOKEN) ======
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("trebetta_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // ignore errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ====== RESPONSE INTERCEPTOR (AUTO-LOGOUT ON 401) ======
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend says "Unauthorized" → token invalid or expired
    if (error?.response?.status === 401) {
      console.warn("⛔ Session expired — clearing localStorage and redirecting");

      // Clear all authentication data
      localStorage.removeItem("trebetta_token");
      localStorage.removeItem("trebetta_user");
      localStorage.removeItem("session_id");

      // Immediately move user to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
