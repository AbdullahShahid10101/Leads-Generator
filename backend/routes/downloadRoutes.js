const express = require('express');
const router = express.Router();
const { exportLeads, getDownloadHistory, getAvailableLists } = require('../controllers/downloadController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/v1/download/export - Export leads in various formats
router.post('/export', authenticateToken, exportLeads);

// GET /api/v1/download/history - Get download history for user
router.get('/history', authenticateToken, getDownloadHistory);

// GET /api/v1/download/lists - Get available industry-location combinations
router.get('/lists', authenticateToken, getAvailableLists);

module.exports = router;
