import axios from "axios";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000/api/v1";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createCreditsCheckout({ quantity, tierId, unitPriceCents }) {
  const res = await axios.post(
    `${API_URL}/billing/checkout/credits`,
    { quantity, tierId, unitPriceCents },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}

export async function createSubscriptionCheckout({ priceId, planName }) {
  const res = await axios.post(
    `${API_URL}/billing/checkout/subscription`,
    { priceId, planName },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}

export async function debitCredits(amount) {
  const res = await axios.post(
    `${API_URL}/billing/credits/debit`,
    { amount },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}

export async function creditCredits(amount) {
  const res = await axios.post(
    `${API_URL}/billing/credits/credit`,
    { amount },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}


