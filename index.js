const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const memoryRoutes = require('./routes/memory');

app.use('/api/auth', authRoutes);
app.use('/api/memory', memoryRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'Smaran backend running',
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Smaran backend running on port ${PORT}`);
  console.log(`\n  Auth endpoints:`);
  console.log(`  POST  /api/auth/signup`);
  console.log(`  POST  /api/auth/login`);
  console.log(`  GET   /api/auth/profile`);
  console.log(`\n  Memory endpoints:`);
  console.log(`  POST  /api/memory        — save memory`);
  console.log(`  POST  /api/memory/ask    — query memories`);
  console.log(`  GET   /api/memory/all    — list all memories`);
  console.log(`  DELETE /api/memory/:id  — delete memory`);
});