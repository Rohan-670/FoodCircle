const express = require('express');
const cors = require('cors');
const environment = require('./config/environment');
const apiRoutes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const notFoundHandler = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/response');

const app = express();

// Enable CORS for client application
app.use(
  cors({
    origin: environment.clientUrl,
    credentials: true,
  })
);

// HTTP request logging
app.use(requestLogger);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

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
