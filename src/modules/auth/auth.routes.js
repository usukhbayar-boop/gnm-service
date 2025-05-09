const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authMiddleware = require("./auth.middleware");

router.post("/login/google", authController.loginWithGoogle);
router.post("/me/update", authMiddleware, authController.updateMember);
router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
