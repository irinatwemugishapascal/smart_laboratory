require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const experimentRoutes = require('./routes/experiments');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');
const badgeRoutes = require('./routes/badges');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});

app.use(limiter);
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/badges', badgeRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'SmartLaboratory API'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.warn('⚠️  Database not connected. Some features may not work properly.');
  }
  
  app.listen(PORT, () => {
    console.log(`\n🚀 SmartLaboratory Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log('\n📚 Available endpoints:');
    console.log('   POST /api/auth/register     - User registration');
    console.log('   POST /api/auth/login        - User login');
    console.log('   GET  /api/experiments       - List experiments');
    console.log('   GET  /api/dashboard/student - Student dashboard');
    console.log('   GET  /api/dashboard/teacher - Teacher dashboard');
    console.log('   POST /api/ai/chat           - AI chat assistant');
    console.log('   GET  /api/health            - Health check\n');
  });
};

startServer();

module.exports = app;
