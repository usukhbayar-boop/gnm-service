const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./modules/user/user.routes');
const paymentRoutes = require('./modules/payment/payment.routes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

module.exports = app;
