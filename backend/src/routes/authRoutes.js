const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/login - Authenticate user and return JWT
router.post('/login', authController.login);

// GET /api/auth/me - Return currently authenticated user (requires token)
router.get('/me', authMiddleware, authController.me);

module.exports = router;
