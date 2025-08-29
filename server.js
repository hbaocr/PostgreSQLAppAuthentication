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

// Index verification endpoint
app.get('/indexes', async (req, res) => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'authdb',
      user: process.env.DB_USER || 'authuser',
      password: process.env.DB_PASSWORD || 'authuser123',
    });

    // Test if indexes are working by timing queries
    const startTime = Date.now();
    const result = await pool.query("SELECT COUNT(*) FROM userAuth WHERE mail = 'john.doe@example.com'");
    const endTime = Date.now();
    
    const queryTime = endTime - startTime;
    
    await pool.end();
    
    res.json({
      success: true,
      message: 'Index verification completed',
      query_time_ms: queryTime,
      user_count: result.rows[0].count,
      index_status: queryTime < 10 ? '✅ Index working (fast query)' : '⚠️  Index might be slow',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Index verification failed',
      error: error.message,
      timestamp: new Date().toISOString()
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
      indexes: 'GET /indexes',
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      getUser: 'GET /api/auth/user/:email',
      deleteUser: 'DELETE /api/auth/user/:email',
      changePassword: 'PUT /api/auth/user/password',
      changeEmail: 'PUT /api/auth/user/email',
      getAllUsers: 'GET /api/auth/users',
      userExists: 'GET /api/auth/user/:email/exists'
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
