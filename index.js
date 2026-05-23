const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const memoryRoutes = require('./routes/memory');

// Mount routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/memory', memoryRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Smaran backend running', 
    timestamp: new Date().toISOString(),
    version: '2.0.0 (with auth)'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Smaran backend running on port ${PORT}`);
  console.log(`✓ Version: 2.0.0 (with Authentication & Role Separation)`);
  console.log(`✓ API endpoints:`);
  console.log(`\n  Authentication:`);
  console.log(`  POST   /api/auth/signup        - Register new user`);
  console.log(`  POST   /api/auth/login         - Login user`);
  console.log(`  POST   /api/auth/logout        - Logout user`);
  console.log(`  GET    /api/auth/profile       - Get user profile`);
  console.log(`  PUT    /api/auth/profile       - Update profile`);
  console.log(`  PUT    /api/auth/password      - Change password`);
  console.log(`\n  Memories (require auth):`);
  console.log(`  POST   /api/memory             - Save a new memory`);
  console.log(`  POST   /api/memory/ask         - Query memories and get answer`);
  console.log(`  GET    /api/memory/all         - Get all memories`);
  console.log(`  GET    /api/memory/:id         - Get specific memory`);
  console.log(`  PUT    /api/memory/:id         - Update memory`);
  console.log(`  DELETE /api/memory/:id         - Delete memory`);
});