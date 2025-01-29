const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./modules/user/user.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const webhookRoutes = require('./modules/webhook/webhook.routes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhook', webhookRoutes);

module.exports = app;
