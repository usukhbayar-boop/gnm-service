const express = require("express");
const { qpayWebhook, golomtCardWebhook } = require("./webhook.controller");

const router = express.Router();

router.get("/qpay", qpayWebhook);
router.get("/golomt", golomtCardWebhook);

module.exports = router;
