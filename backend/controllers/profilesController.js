const { supabase } = require('../config/supabase');

// Get user by ID (from profiles)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
            });
        }
        
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        
        if (!profile) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        return res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Server error' 
        });
    }
};

// Update user profile
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        
        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
            });
        }

        delete updates.id;
        delete updates.created_at;

        if (!updates.full_name && (updates.first_name || updates.last_name)) {
            const first = updates.first_name ?? '';
            const last = updates.last_name ?? '';
            updates.full_name = [first, last].filter(Boolean).join(' ').trim();
        }
        
        const { data: updated, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        
        if (!updated) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        return res.json({
            success: true,
            message: "User updated successfully",
            data: updated
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Server error' 
        });
    }
};

// Get user profile (same as basic profile here)
const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
            });
        }
        
        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (profileErr) throw profileErr;
        
        if (!profile) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        return res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message || 'Server error' 
        });
    }
};

module.exports = {
    getUserById,
    updateUser,
    getUserProfile
};


