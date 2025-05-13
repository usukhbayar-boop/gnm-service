const express = require("express");
const {
  listPaymentCards,
  linkPaymentCard,
  removePaymentCard,
} = require("./cart-payment.controller");
const { authMiddleware } = require("../../auth/auth.middleware");

const router = express.Router();

router.get("/payment-card/:user_id", authMiddleware, listPaymentCards);
router.post("/payment-card", authMiddleware, linkPaymentCard);
router.delete("/payment-card", authMiddleware, removePaymentCard);

module.exports = router;
