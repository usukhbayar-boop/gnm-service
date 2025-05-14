const express = require("express");
const {
  listPaymentCards,
  linkPaymentCard,
  removePaymentCard,
} = require("./cart-payment.controller");
const authMiddleware = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/payment-card/:user_id", listPaymentCards);
router.post("/payment-card", linkPaymentCard);
router.delete("/payment-card", removePaymentCard);

module.exports = router;
