const express = require('express');
const { login, addAdmin, updateAdmin, removeAdmin } = require('./user.controller');
const { authenticate, isAdmin } = require('./user.service');

const router = express.Router();

// router.get('/', getAllUsers);
router.post('/login', login);
router.post('/add', addAdmin);
router.post('/update', updateAdmin);
router.post('/remove', removeAdmin);

module.exports = router;
