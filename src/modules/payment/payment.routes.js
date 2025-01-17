const express = require('express');
const { processPayment, createCampaignOrder, checkInvoice } = require('./payment.controller');

const router = express.Router();

router.post('/process', processPayment);
router.post('/create-campaign', createCampaignOrder);
router.get('/check-invoice', checkInvoice);

module.exports = router;
