const { supabase, adminSupabase } = require('../config/supabase');

// List leads (owned by the user)
const listLeads = async (req, res) => {
    try {
        const { search, limit = 100, offset = 0 } = req.query;

        if (!req.user?.id) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Prefer service-role client to avoid RLS 401, and enforce user filter explicitly
        const db = adminSupabase || supabase;

        let query = db
            .from('leads')
            .select('*')
            .eq('added_by', req.user.id)
            .order('created_at', { ascending: false })
            .range(Number(offset), Number(offset) + Number(limit) - 1);

        if (search) {
            // Basic ilike filters on a few columns
            query = query.or(
                `name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`
            );
        }

        const { data, error } = await query;
        if (error) throw error;

        return res.json({ success: true, data });
    } catch (error) {
        console.error('List leads error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
};

// Create a new lead
const createLead = async (req, res) => {
    try {
        const {
            name,
            company,
            industry,
            email,
            phone,
            location,
            source
        } = req.body || {};

        // Basic validation
        if (!name || !company) {
            return res.status(400).json({ success: false, error: 'name and company are required' });
        }

        const payload = {
            name: name || null,
            company: company || null,
            industry: industry || null,
            email: email || null,
            phone: phone || null,
            location: location || null,
            source: source || null,
            // rely on DB trigger to set added_by if null; set explicitly if available
            ...(req.user?.id ? { added_by: req.user.id } : {})
        };

        const { data, error } = await supabase
            .from('leads')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Create lead error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
};

// Get a single lead (owned by the user)
const getLead = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, error: 'id is required' });

        const query = supabase
            .from('leads')
            .select('*')
            .eq('id', id)
            .single();

        const { data, error } = await query;
        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Lead not found' });

        // Optional additional ownership check if not relying solely on RLS
        if (req.user?.id && data.added_by && data.added_by !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        return res.json({ success: true, data });
    } catch (error) {
        console.error('Get lead error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
};

// Update a lead (only own)
const updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        if (!id) return res.status(400).json({ success: false, error: 'id is required' });

        // Disallow immutable fields
        delete updates.id;
        delete updates.added_by;
        delete updates.created_at;

        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Lead not found' });

        if (req.user?.id && data.added_by && data.added_by !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        return res.json({ success: true, message: 'Lead updated successfully', data });
    } catch (error) {
        console.error('Update lead error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
};

// Delete a lead (only own)
const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, error: 'id is required' });

        const { data, error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Lead not found' });

        if (req.user?.id && data.added_by && data.added_by !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        return res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Delete lead error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
};

module.exports = {
    listLeads,
    getLead,
    updateLead,
    createLead,
    deleteLead
};