const express = require('express');
const router = express.Router();
const {
    listLeads,
    createLead,
    getLead,
    updateLead,
    deleteLead
} = require('../controllers/leadsController');
const { authenticateToken } = require('../middleware/auth');
// GET, POST /api/v1/leads - list and create
router.route("/")
  .get(authenticateToken, listLeads)
  .post(authenticateToken, createLead);
// GET, PUT, DELETE /api/v1/leads/:id - get, update, delete
router.route("/:id")
  .get(authenticateToken, getLead)
  .put(authenticateToken, updateLead)
  .delete(authenticateToken, deleteLead);
module.exports = router;
