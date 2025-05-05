const express = require("express");
const {
  listPaymentCards,
  linkPaymentCard,
} = require("./cart-payment.controller");

const router = express.Router();

router.get("/payment-card/:user_id", listPaymentCards);
router.post("/payment-card", linkPaymentCard);

module.exports = router;
