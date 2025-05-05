const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./modules/user/user.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const webhookRoutes = require("./modules/webhook/webhook.routes");
const analyticRoutes = require("./modules/analytics/analytic.routes");
const authRoutes = require("./modules/auth/auth.routes");
const billRoutes = require("./modules/bill/cart-payment/cart-payment.routes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/analytics", analyticRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
