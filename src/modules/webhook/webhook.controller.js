const axios = require("axios");
const { hookHandler, handleGolomtWebhook } = require("./webhook.service");

//v2/payment/check
exports.qpayWebhook = async (req, res) => {
  const { bill_id } = req.query;
  hookHandler(bill_id);
  res.status(200).json({
    message: "Ok",
  });
};

//v2/payment/check
exports.golomtCardWebhook = async (req, res) => {
  const { status, refno } = req.query;
  const redirect_url = handleGolomtWebhook(status, refno);
  res.redirect(redirect_url || "goodneighbors.org.mn");
};
