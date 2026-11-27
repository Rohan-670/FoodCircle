const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const environment = require('./config/environment');
const apiRoutes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const notFoundHandler = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/response');

const app = express();

app.disable('x-powered-by');
if (environment.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Enable CORS for allowed client origins
app.use(
  cors({
    origin: environment.allowedOrigins,
    credentials: true,
  })
);

// HTTP request logging
app.use(requestLogger);

// Body parsers & cookie parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded donation images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root welcome endpoint
app.get('/', (req, res) => {
  return sendSuccess(res, 200, 'Surplus Food Donation & NGO Coordination System API', {
    version: 'v1',
    status: 'online',
    healthCheck: '/api/v1/health',
  });
});

// Mount modular versioned API routes under /api (/api/v1/...)
app.use('/api', apiRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
