const express = require('express');
const router = express.Router();
const {
    getUserById,
    getUserProfile,
    updateUser
} = require('../controllers/profilesController');
const { authenticateToken, checkResourceOwnership } = require('../middleware/auth');

// GET /api/v1/profiles/:id - Get user by ID
router.get('/:id', authenticateToken, checkResourceOwnership('id'), getUserById);

// GET /api/v1/profiles/:id/profile - Get user profile with statistics
router.get('/:id/profile', authenticateToken, checkResourceOwnership('id'), getUserProfile);

// PUT /api/v1/proflies/:id - Update user information
router.put('/:id', authenticateToken, checkResourceOwnership('id'), updateUser);

module.exports = router;


