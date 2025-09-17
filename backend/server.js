const express = require("express");
const dotenv = require("dotenv");
const { testConnection } = require("./config/supabase");

// Import middleware
const corsMiddleware = require("./middleware/cors");
const { logger, errorLogger } = require("./middleware/logger");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { sanitizeInput } = require("./middleware/validation");

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(logger);
app.use(corsMiddleware);
app.use(sanitizeInput);

// API version prefix
const API_VERSION = '/api/v1';

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'lead-harvest-backend', ts: Date.now() });
});

// API info endpoint
app.get(API_VERSION, (req, res) => {
  res.json({
    success: true,
    message: 'Lead Harvest API',
    version: '1.0.0',
    endpoints: {
      auth: `${API_VERSION}/auth`,
      profiles: `${API_VERSION}/profiles`,
      health: '/health'
    }
  });
});

// Routes
app.use(`${API_VERSION}/auth`, require('./routes/authRoutes'));
app.use(`${API_VERSION}/profiles`, require('./routes/profilesRoutes'));
app.use(`${API_VERSION}/leads`, require('./routes/leadsRoutes'));

// 404 handler
app.use(notFound);

// Error handling (must be last)
app.use(errorLogger);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on Port: ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🔗 API documentation at: http://localhost:${PORT}/api/v1`);

  console.log("🔗 Testing Supabase connection...");
  const isConnected = await testConnection();
  if (isConnected) {
    console.log("✅ Supabase connection established");
  } else {
    console.log("⚠️  Supabase connection failed - check your environment variables");
  }

  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Logs enabled: ${process.env.NODE_ENV !== 'production' ? 'Yes' : 'No'}`);
});


