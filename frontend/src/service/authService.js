import axios from "axios";

// Prefer Vite env if provided, fallback to local
const API_URL =
  import.meta?.env?.VITE_API_URL ||
  "https://leadgenerationbackend-production.up.railway.app";

export async function registerUser(userData) {
  try {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res.data;
  } catch (err) {
    throw err.response?.data?.detail || "Signup failed";
  }
}

export async function loginUser(credentials) {
  try {
    console.log("Making login request to:", `${API_URL}/login`);
    const res = await axios.post(`${API_URL}/login`, credentials);
    console.log("Login response:", res.data);
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", credentials.email);
    return res.data;
  } catch (err) {
    console.error("Login error in authService:", err);
    throw err.response?.data?.detail || "Login failed";
  }
}
export function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userEmail");
}
