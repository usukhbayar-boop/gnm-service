const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/login/google', authController.loginWithGoogle);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

module.exports = router;
