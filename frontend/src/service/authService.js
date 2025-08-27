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
    
    // Store token expiration time if provided
    if (res.data.token_expires_at) {
      localStorage.setItem("token_expires_at", res.data.token_expires_at.toString());
    } else {
      // Fallback: Extract expiration time from JWT token directly
      try {
        const token = res.data.access_token;
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const exp = payload.exp;
          if (exp) {
            localStorage.setItem("token_expires_at", exp.toString());
          }
        }
      } catch (error) {
        console.error("Error extracting expiration from JWT:", error);
      }
    }
    

    
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
  localStorage.removeItem("token_expires_at");
}

// Function to check if user is authenticated with valid token
export function isAuthenticated() {
  const token = localStorage.getItem("access_token");
  const isAuth = localStorage.getItem("isAuthenticated");
  const tokenExpiresAt = localStorage.getItem("token_expires_at");
  
  if (!token || !isAuth || isAuth !== "true") {
    return false;
  }
  
  // Check if token is expired using stored expiration time
  if (tokenExpiresAt) {
    const currentTime = Date.now() / 1000;
    const expirationTime = parseInt(tokenExpiresAt);
    
    if (expirationTime && expirationTime < currentTime) {
      // Token is expired, clear storage
      logoutUser();
      return false;
    }
  } else {
    // Fallback: Check if token is expired (JWT tokens have expiration time)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear storage
        logoutUser();
        return false;
      }
    } catch (error) {
      console.error("Error parsing token:", error);
      logoutUser();
      return false;
    }
  }
  
  return true;
}

// Function to check authentication and return status for React components
export function checkAuthStatus() {
  const token = localStorage.getItem("access_token");
  const isAuth = localStorage.getItem("isAuthenticated");
  const tokenExpiresAt = localStorage.getItem("token_expires_at");
  
  if (!token || !isAuth || isAuth !== "true") {
    return { isValid: false, reason: 'no_token' };
  }
  
  // Check if token is expired using stored expiration time
  if (tokenExpiresAt) {
    const currentTime = Date.now() / 1000;
    const expirationTime = parseInt(tokenExpiresAt);
    
    if (expirationTime && expirationTime < currentTime) {
      // Token is expired, clear storage and return expired reason
      logoutUser();
      return { isValid: false, reason: 'expired' };
    }
  } else {
    // Fallback: Check if token is expired (JWT tokens have expiration time)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear storage and return expired reason
        logoutUser();
        return { isValid: false, reason: 'expired' };
      }
    } catch (error) {
      console.error("Error parsing token:", error);
      logoutUser();
      return { isValid: false, reason: 'invalid' };
    }
  }
  
  return { isValid: true };
}

// Function to get remaining time until token expiration (in seconds)
export function getTokenExpirationTime() {
  const tokenExpiresAt = localStorage.getItem("token_expires_at");
  
  if (!tokenExpiresAt) {
    return null;
  }
  
  const currentTime = Date.now() / 1000;
  const expirationTime = parseInt(tokenExpiresAt);
  
  if (expirationTime && expirationTime > currentTime) {
    return Math.floor(expirationTime - currentTime);
  }
  
  return 0; // Token has expired
}

// Function to get formatted time until expiration
export function getFormattedExpirationTime() {
  const remainingSeconds = getTokenExpirationTime();
  
  if (remainingSeconds === null) {
    return "Unknown";
  }
  
  if (remainingSeconds <= 0) {
    return "Expired";
  }
  
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// FOR TESTING: Function to manually set token expiration time
export function setTestTokenExpiration(minutes = 1) {
  const currentTime = Date.now() / 1000;
  const testExpirationTime = currentTime + (minutes * 60);
  localStorage.setItem("token_expires_at", testExpirationTime.toString());
  console.log(`TESTING: Token expiration set to ${minutes} minute(s) from now`);
  console.log("Expiration time:", new Date(testExpirationTime * 1000));
  return testExpirationTime;
}

// FOR TESTING: Function to check current token status
export function getTokenStatus() {
  const tokenExpiresAt = localStorage.getItem("token_expires_at");
  if (!tokenExpiresAt) {
    return { status: "No token found", remaining: null };
  }
  
  const currentTime = Date.now() / 1000;
  const expirationTime = parseInt(tokenExpiresAt);
  const remainingSeconds = Math.floor(expirationTime - currentTime);
  
  if (remainingSeconds <= 0) {
    return { status: "Expired", remaining: 0 };
  }
  
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  return {
    status: "Valid",
    remaining: remainingSeconds,
    formatted: `${minutes}m ${seconds}s`
  };
}
