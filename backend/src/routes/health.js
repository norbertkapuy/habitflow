const express = require('express');
const { testConnection } = require('../config/database');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const dbHealthy = await testConnection();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime)}s`,
      database: dbHealthy ? 'connected' : 'disconnected',
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
      },
      version: '1.0.0'
    };

    res.status(dbHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed system info (for monitoring)
router.get('/detailed', async (req, res) => {
  try {
    const dbHealthy = await testConnection();
    
    res.json({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      database: {
        status: dbHealthy ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;