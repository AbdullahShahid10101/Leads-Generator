// controllers/listController.js
const { supabase } = require('../config/supabase');

// Get recent lists from leads (grouped by industry + location)
const getRecentLists = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('leads')
      .select('industry, location, created_at')
      .eq('added_by', req.user.id);

    if (error) throw error;

    // Group in JS
    const grouped = {};
    data.forEach((lead) => {
      const key = `${lead.industry || 'Unknown'}-${lead.location || 'Unknown'}`;
      if (!grouped[key]) {
        grouped[key] = {
          industry: lead.industry || 'Unknown',
          location: lead.location || 'Unknown',
          created_at: lead.created_at,
          verified_count: 0, // always 0 (no email_verified column)
          total: 1,
        };
      } else {
        grouped[key].total += 1;
        if (new Date(lead.created_at) > new Date(grouped[key].created_at)) {
          grouped[key].created_at = lead.created_at;
        }
      }
    });

    const result = Object.values(grouped)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get recent lists error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

// controllers/listController.js
const getListLeads = async (req, res) => {
  try {
    const { industry, location } = req.query;
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (!industry || !location) {
      return res.status(400).json({ success: false, error: 'industry and location are required' });
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('added_by', req.user.id)
      .eq('industry', industry)
      .eq('location', location)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Get list leads error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

module.exports = { getRecentLists, getListLeads };
