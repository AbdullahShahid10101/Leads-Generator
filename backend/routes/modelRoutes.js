const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

const router = express.Router();

const PY_PROXY_URL = process.env.PY_PROXY_URL || process.env.PY_API_URL || 'http://localhost:8001';
const PY_CAPTCHA_URL = process.env.PY_CAPTCHA_URL || 'http://localhost:8002';
const PY_SCRAPER_URL = process.env.PY_SCRAPER_URL || 'http://localhost:8003';
const PY_EXPORT_URL = process.env.PY_EXPORT_URL || 'http://localhost:8004';
const PY_COMPREHENSIVE_SCRAPER_URL = process.env.PY_COMPREHENSIVE_SCRAPER_URL || 'http://localhost:8005';
const SCRAPE_CREDIT_COST = parseInt(process.env.SCRAPE_CREDIT_COST || '5', 10);
const COMPREHENSIVE_SCRAPE_CREDIT_COST = parseInt(process.env.COMPREHENSIVE_SCRAPE_CREDIT_COST || '5', 10);

// Proxy to Python model API - no automatic insertion
router.post('/predict', authenticateToken, async (req, res) => {
  try {
    const { data } = await axios.post(`${PY_PROXY_URL}/predict`, req.body, { timeout: 30000 });
    return res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
    return res.status(status).json({ success: false, error: msg });
  }
});

// Proxy Rotation API passthrough
router.get('/proxies', authenticateToken, async (req, res) => {
    try {
        const n = req.query.n || 5;
        const { data } = await axios.get(`${PY_PROXY_URL}/proxies`, { params: { n }, timeout: 30000 });
        return res.json({ success: true, data });
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
        return res.status(status).json({ success: false, error: msg });
    }
});

// Captcha/Playwright API passthrough
router.get('/get_ip', authenticateToken, async (req, res) => {
    try {
        const { data } = await axios.get(`${PY_CAPTCHA_URL}/get_ip`, { timeout: 60000 });
        return res.json(data);
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
        return res.status(status).json({ success: false, error: msg });
    }
});

// Automated Scraper API passthrough
router.get('/scrape', authenticateToken, async (req, res) => {
    try {
        const { data } = await axios.get(`${PY_SCRAPER_URL}/scrape`, { timeout: 60000 });
        return res.json(data);
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
        return res.status(status).json({ success: false, error: msg });
    }
});

router.get('/status', authenticateToken, async (req, res) => {
    try {
        const { data } = await axios.get(`${PY_SCRAPER_URL}/status`, { timeout: 15000 });
        return res.json(data);
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
        return res.status(status).json({ success: false, error: msg });
    }
});

// Comprehensive Scraper Routes
router.post('/scrape/comprehensive', authenticateToken, async (req, res) => {
    try {
    // Debit credits before initiating comprehensive scrape
    const { error: debitError } = await supabase.rpc('decrement_user_credits', {
      p_user_id: req.user.id,
      p_delta: COMPREHENSIVE_SCRAPE_CREDIT_COST
    });
    if (debitError) {
      return res.status(402).json({ success: false, error: 'Not enough credits' });
    }

        const { data } = await axios.post(`${PY_COMPREHENSIVE_SCRAPER_URL}/scrape/comprehensive`, req.body, { timeout: 30000 });
        return res.json(data);
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
        return res.status(status).json({ success: false, error: msg });
    }
});

router.get('/scrape/status/:jobId', authenticateToken, async (req, res) => {
    try {
        const { jobId } = req.params;
        const { data } = await axios.get(`${PY_COMPREHENSIVE_SCRAPER_URL}/scrape/status/${jobId}`, { timeout: 15000 });
        return res.json(data);
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
        return res.status(status).json({ success: false, error: msg });
    }
});

router.get('/scrape/results/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { data } = await axios.get(`${PY_COMPREHENSIVE_SCRAPER_URL}/scrape/results/${jobId}`, { timeout: 15000 });

    // Return results without inserting into database - will be saved after cleaning
    return res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
    return res.status(status).json({ success: false, error: msg });
  }
});

router.get('/scrape/sources', authenticateToken, async (req, res) => {
    try {
        const { data } = await axios.get(`${PY_COMPREHENSIVE_SCRAPER_URL}/scrape/sources`, { timeout: 15000 });
        return res.json(data);
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
        return res.status(status).json({ success: false, error: msg });
    }
});

router.get('/scrape/jobs', authenticateToken, async (req, res) => {
    try {
        const { data } = await axios.get(`${PY_COMPREHENSIVE_SCRAPER_URL}/scrape/jobs`, { timeout: 15000 });
        return res.json(data);
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
        return res.status(status).json({ success: false, error: msg });
    }
});

// Standalone cleaning route
router.post('/clean', authenticateToken, async (req, res) => {
    try {
        const { data } = await axios.post(`${PY_COMPREHENSIVE_SCRAPER_URL}/clean`, req.body, { timeout: 60000 });
        return res.json(data);
    } catch (err) {
        const status = err.response?.status || 500;
        const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Python service error';
        return res.status(status).json({ success: false, error: msg });
    }
});

// Save cleaned leads to database
router.post('/leads/save', authenticateToken, async (req, res) => {
    try {
        const { leads } = req.body;
        
        if (!Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({ success: false, error: "No leads provided" });
        }

        // Normalize and insert leads with proper user authentication
        const normalized = leads.map((lead) => ({
            name: lead.name ?? null,
            company: lead.company ?? lead.name ?? null,
            industry: lead.industry ?? null,
            email: lead.email ?? null,
            phone: lead.phone ?? null,
            location: lead.location ?? lead.address ?? null,
            source: lead.source ?? 'cleaned_scraper',
            added_by: req.user?.id // Ensure user ID is set for RLS
        }));

        const { data: inserted, error: insertErr } = await supabase
            .from('leads')
            .insert(normalized)
            .select();

        if (insertErr) {
            console.error('Supabase insert error:', insertErr);
            return res.status(500).json({ success: false, error: insertErr.message });
        }

        return res.json({
            success: true,
            message: `Successfully saved ${inserted?.length || 0} cleaned leads`,
            inserted_count: inserted?.length || 0,
            leads: inserted
        });
    } catch (err) {
        console.error('Error saving leads:', err);
        return res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
});

module.exports = router;


