require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Routes
const adminRoutes = require('./routes/admin');
const deliveryRoutes = require('./routes/delivery');
const path = require('path');

app.use('/api/admin', adminRoutes);
app.use('/api', deliveryRoutes);
app.use('/sandbox', express.static(path.join(__dirname, '../')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Ad Engine running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
