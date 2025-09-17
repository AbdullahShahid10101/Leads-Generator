const express = require('express');
const router = express.Router();
const {
    createLead,
    getLead,
    updateLead,
    deleteLead
} = require('../controllers/leadsController');
const { authenticateToken } = require('../middleware/auth');
// POST /api/v1/leads - lead creation
router.route("/").post(authenticateToken, createLead);
// PUT,Get,Delete /api/v1/leads/id - get,update,dekete lead 
router.route("/:id").get(authenticateToken, getLead).put(authenticateToken, updateLead).delete(authenticateToken, deleteLead);
module.exports = router;
