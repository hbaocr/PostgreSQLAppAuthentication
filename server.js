import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import { requestLogger } from './src/middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PostgreSQL Authentication API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      getUser: 'GET /api/auth/user/:email'
    },
    documentation: 'Check the docs/ directory for detailed API documentation'
  });
});

// 404 handler
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection first
    console.log('🔌 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please ensure PostgreSQL is running.');
      process.exit(1);
    }

    // Start the server
    app.listen(PORT, () => {
      console.log('🚀 Server is running!');
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 API Base: http://localhost:${PORT}/api/auth`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
