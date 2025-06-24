const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const habitRoutes = require('./routes/habits');
const entryRoutes = require('./routes/entries');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Initialize database
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/entries', entryRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'HabitFlow API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      habits: '/api/habits',
      entries: '/api/entries'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  // Database errors
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HabitFlow API Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});