require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
const createRateLimiter = require('./middlewares/rateLimiter');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const securityHeaders = require('./middlewares/securityHeaders');

// Import middlewares
const logger = require('./middlewares/logger');
const { errorHandler } = require('./middlewares/errorHandler');
const { authMiddleware } = require('./middlewares/authMiddleware');
const authService = require('./services/authService');
const { USER_ROLES } = require('./utils/constants');

// Import routes
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const billingRoutes = require('./routes/billing');
const departmentRoutes = require('./routes/departments');
const doctorRoutes = require('./routes/doctors');
const equipmentRoutes = require('./routes/equipment');
const staffRoutes = require('./routes/staff');
const roomRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');

const app = express();
const port = process.env.PORT || 3000;

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(logger);

// Security Middleware
app.use(helmet()); // Security headers
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(securityHeaders);

// Basic routes
app.get('/', (req, res) => {
  res.send('Welcome to the Hospital Management API!');
});

// Auth routes (unprotected)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/patients', authMiddleware, patientRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api/billing', authMiddleware, billingRoutes);
app.use('/api/departments', authMiddleware, departmentRoutes);
app.use('/api/doctors', authMiddleware, doctorRoutes);
app.use('/api/equipment', authMiddleware, equipmentRoutes);
app.use('/api/staff', 
  authMiddleware, 
  authService.verifyRole([USER_ROLES.ADMIN, USER_ROLES.STAFF]), 
  staffRoutes
);
app.use('/api/rooms', authMiddleware, roomRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

// Error handling middleware
app.use(errorHandler);

// Rate limiting
app.use('/api', createRateLimiter());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
