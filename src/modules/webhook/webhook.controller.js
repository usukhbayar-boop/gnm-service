const axios = require('axios');
const { hookHandler } = require('./webhook.service');

//v2/payment/check
exports.qpayWebhook = async (req, res) => {
    const { bill_id } = req.query;
    hookHandler(bill_id);
    res.status(200).json({
      message: 'Ok'
  });
};

