import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import productRoutes from './routes/productRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware: CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development for seamless demo
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Middleware: Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected / Standalone';
  res.status(200).json({
    status: 'online',
    service: 'ProductMatch DSA Backend API',
    mongoDB: mongoStatus,
    timestamp: new Date().toISOString()
  });
});

// Mount Product Routes
// /api/products, /api/products/search?q=
app.use('/api/products', productRoutes);

// Alias: /api/match directly mapped as required in prompt
app.post('/api/match', (req, res, next) => {
  req.url = '/match';
  productRoutes(req, res, next);
});

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Route not found on API server`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[API Server Error]:', err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ProductMatch Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`📦 Products API:  http://localhost:${PORT}/api/products`);
  console.log(`🔍 Search API:    http://localhost:${PORT}/api/products/search?q=iphone`);
  console.log(`⚡ Match API:     POST http://localhost:${PORT}/api/match`);
  console.log(`====================================================`);
});
