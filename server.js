const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const MONGO_URI = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');

if (!MONGO_URI) {
  console.error(' CRITICAL: MONGO_URI is not defined in environment variables!');
  console.log('Available environment variables:', Object.keys(process.env).filter(k => k.includes('MONGO')));
}

let lastDbError = null;

// Better connection options for Vercel/Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    console.log(' Connecting to MongoDB...');
    // Redacted URI for logging
    const redactedUri = MONGO_URI ? MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'undefined';
    console.log(` Target: ${redactedUri}`);

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: 'agentra' ,// Explicitly set DB name

    });
    console.log(' MongoDB Connected');
    lastDbError = null;
  } catch (err) {
    lastDbError = err.message;
    console.error(' MongoDB Connection Failed:', err.message);
  }
};

// Connect immediately
connectDB();

// Middleware to ensure DB is connected before processing requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get('/', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    message: 'Agentra API Server',
    version: '1.0.0',
    status: 'running',
    dbStatus: dbStates[mongoose.connection.readyState],
    dbError: lastDbError,
    endpoints: {
      auth: '/api/auth',
      packages: '/api/packages',
      bookings: '/api/bookings',
      users: '/api/users',
      agents: '/api/agents',
      dashboard: '/api/dashboard',
      analytics: '/api/analytics',
      subscription: '/api/subscription',
      payments: '/api/payments',
      earnings: '/api/earnings',
      search: '/api/search',
      chatbot: '/api/chatbot',
      promotion: '/api/promotion',
      refund: '/api/refund',
      saved: '/api/saved'
    }
  });
});

app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/packages', require('./src/routes/package.routes'));
app.use('/api/bookings', require('./src/routes/booking.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/agents', require('./src/routes/agent.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/analytics', require('./src/routes/analytics.routes'));
app.use('/api/subscription', require('./src/routes/subscription.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/earnings', require('./src/routes/earnings.routes'));
app.use('/api/search', require('./src/routes/search.routes'));
app.use('/api/chatbot', require('./src/routes/chatbot.routes'));
app.use('/api/promotion', require('./src/routes/promotion.routes'));
app.use('/api/refund', require('./src/routes/refund.routes'));
app.use('/api/saved', require('./src/routes/saved.routes'));
app.use('/api/owner', require('./src/routes/owner.routes'));
app.use('/api/upload', require('./src/routes/upload')); 

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      '/api/auth',
      '/api/packages',
      '/api/bookings',
      '/api/users',
      '/api/agents',
      '/api/dashboard',
      '/api/analytics',
      '/api/subscription',
      '/api/payments',
      '/api/earnings',
      '/api/search',
      '/api/chatbot',
      '/api/promotion',
      '/api/refund',
      '/api/saved'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;