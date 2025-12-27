const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /login - Verify user PIN
router.post('/login', authController.login);

// POST /register - Create user with optional PIN
router.post('/register', authController.register);

module.exports = router;