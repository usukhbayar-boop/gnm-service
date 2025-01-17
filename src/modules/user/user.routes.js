const express = require('express');
const { getAllUsers } = require('./user.controller');

const router = express.Router();

router.get('/', getAllUsers);

module.exports = router;
