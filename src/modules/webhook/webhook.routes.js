const express = require('express');
const { qpayWebhook } = require('./webhook.controller');

const router = express.Router();

router.get('/qpay', qpayWebhook);

module.exports = router;
