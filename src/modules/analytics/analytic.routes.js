const express = require('express');
const { hitsByDays, hitsByMonth } = require('./analytic.controller');

const router = express.Router();

router.get('/hits-by-day', hitsByDays);
router.get('/hits-by-month', hitsByMonth);

module.exports = router;
