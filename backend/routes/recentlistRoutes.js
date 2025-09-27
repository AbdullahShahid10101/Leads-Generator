// routes/listRoutes.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getRecentLists, getListLeads } = require('../controllers/recentlistController');
const router = express.Router();

router.get('/recent',authenticateToken, getRecentLists);        // recent grouped lists
router.get('/leads', authenticateToken,getListLeads);           // leads for one list

module.exports = router;
