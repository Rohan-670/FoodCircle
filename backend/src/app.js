const express = require('express');
const cors = require('cors');
const environment = require('./config/environment');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable CORS for client application
app.use(
  cors({
    origin: environment.clientUrl,
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Surplus Food Donation & NGO Coordination System API',
    version: '1.0.0',
    status: 'online',
    documentation: '/api/health',
  });
});

// Mount modular API routes under /api
app.use('/api', apiRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
