const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const hospitalRoutes = require('./routes/hospitals');
const resourceRoutes = require('./routes/resources');
const resourceRequestRoutes = require('./routes/resourceRequests');
const transferRoutes = require('./routes/transfers');
const captchaRoutes = require('./routes/captcha');
const hospitalAuthRoutes = require('./routes/hospitalAuth');
const hospitalDashboardRoutes = require('./routes/hospitalDashboard');
const specialistRoutes = require('./routes/specialists');
const googleAuthRoutes = require('./routes/googleAuth');
const emailRoutes = require('./routes/email');
const hospitalPatientRoutes = require('./routes/hospitalPatients');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/captcha', captchaRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/resource-requests', resourceRequestRoutes);
app.use('/api/v1/transfers', transferRoutes);
app.use('/api/hospital-auth', hospitalAuthRoutes);
app.use('/api/hospital', hospitalDashboardRoutes);
app.use('/api/specialists', specialistRoutes);
app.use('/auth', googleAuthRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/hospital-patients', hospitalPatientRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Pranika API running' }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`🚀 Pranika server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
