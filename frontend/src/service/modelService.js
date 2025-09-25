import axios from "axios";

// Base URL points to Node backend which proxies to Python services
const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000/api/v1";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getProxies(n = 5) {
  const res = await axios.get(`${API_URL}/model/proxies`, {
    params: { n },
    headers: { ...authHeaders() },
  });
  return res.data?.data ?? res.data;
}

export async function predict(payload) {
  const res = await axios.post(`${API_URL}/model/predict`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.data;
}

export async function getIp() {
  const res = await axios.get(`${API_URL}/model/get_ip`, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

export async function runScrape() {
  const res = await axios.get(`${API_URL}/model/scrape`, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

export async function getScrapeStatus() {
  const res = await axios.get(`${API_URL}/model/status`, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

// Comprehensive Scraper Functions
export async function startComprehensiveScrape(payload) {
  const res = await axios.post(`${API_URL}/model/scrape/comprehensive`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.data;
}

export async function getScrapeJobStatus(jobId) {
  const res = await axios.get(`${API_URL}/model/scrape/status/${jobId}`, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

export async function getScrapeJobResults(jobId) {
  const res = await axios.get(`${API_URL}/model/scrape/results/${jobId}`, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

export async function getAvailableSources() {
  const res = await axios.get(`${API_URL}/model/scrape/sources`, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

export async function getScrapeJobs() {
  const res = await axios.get(`${API_URL}/model/scrape/jobs`, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

export async function saveCleanedLeads(leads) {
  const res = await axios.post(`${API_URL}/model/leads/save`, { leads }, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.data;
}

export async function cleanLeads(leads) {
  const res = await axios.post(`${API_URL}/model/clean`, { leads }, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.data;
}

// Fetch saved leads from DB (current user, respects RLS)
export async function getSavedLeads({ search, limit = 100, offset = 0 } = {}) {
  const res = await axios.get(`${API_URL}/leads`, {
    params: { search, limit, offset },
    headers: { ...authHeaders() },
  });
  return res.data?.data ?? res.data;
}

