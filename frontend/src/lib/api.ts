import axios from "axios";

/**
 * Central API configuration.
 * Change the BASE_URL here and it updates across the entire app.
 */
export const API_BASE_URL = "https://trevia-hrnw.onrender.com";

/** Pre-configured axios instance — import this instead of raw axios. */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;
