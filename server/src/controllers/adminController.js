import crypto from 'crypto';
import { supabase } from '../config/supabase.js';

const SUPER_ADMIN_KEY = process.env.SUPER_ADMIN_KEY || 'SUPER_ADMIN_2026';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(String(password || '')).digest('hex');
};

export const adminController = {
  // GET /api/admin/users - Get all registered users from Supabase profiles
  async getAllUsers(req, res) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        count: (data || []).length,
        data: data || [],
      });
    } catch (err) {
      console.error('getAllUsers error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/admin/create-examiner - Super admin creates a new examiner directly in Supabase
  async createExaminer(req, res) {
    try {
      const { full_name, email, password } = req.body;

      if (!full_name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Full name, email, and password are required to create an examiner account.',
        });
      }

      const formattedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', formattedEmail)
        .single();

      if (existing) {
        // If already exists, update their role to examiner!
        const { data: updated, error: updateErr } = await supabase
          .from('profiles')
          .update({
            role: 'examiner',
            full_name: full_name.trim(),
            password_hash: hashPassword(password),
          })
          .eq('email', formattedEmail)
          .select('id, email, full_name, role, avatar_url, created_at')
          .single();

        if (updateErr) throw updateErr;

        return res.json({
          success: true,
          message: `Existing user ${formattedEmail} has been updated to Examiner in Supabase!`,
          data: updated,
        });
      }

      // Create new examiner profile in Supabase
      const newExaminer = {
        email: formattedEmail,
        full_name: full_name.trim(),
        role: 'examiner',
        password_hash: hashPassword(password),
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedEmail)}`,
        created_at: new Date().toISOString(),
      };

      const { data: created, error } = await supabase
        .from('profiles')
        .insert([newExaminer])
        .select('id, email, full_name, role, avatar_url, created_at')
        .single();

      if (error) {
        console.error('Supabase createExaminer error:', error);
        throw error;
      }

      res.status(201).json({
        success: true,
        message: `Examiner ${created.full_name} (${created.email}) created and authorized in Supabase!`,
        data: created,
      });
    } catch (err) {
      console.error('createExaminer error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/admin/update-role - Update any user's role in Supabase
  async updateUserRole(req, res) {
    try {
      const { user_id, new_role } = req.body;

      if (!user_id || !new_role) {
        return res.status(400).json({ success: false, message: 'user_id and new_role are required' });
      }

      if (!['student', 'examiner', 'admin', 'super_admin'].includes(new_role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ role: new_role })
        .eq('id', user_id)
        .select('id, email, full_name, role')
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: `User role updated to ${new_role} in Supabase`,
        data,
      });
    } catch (err) {
      console.error('updateUserRole error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/admin/users/:id - Delete a user from Supabase
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;

      res.json({ success: true, message: 'User deleted from Supabase database' });
    } catch (err) {
      console.error('deleteUser error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/admin/claim-super-admin - Setup or claim the Super Admin account
  async claimSuperAdmin(req, res) {
    try {
      const { email, password, full_name, super_admin_key } = req.body;

      if (!super_admin_key || super_admin_key.trim() !== SUPER_ADMIN_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Invalid Super Admin Master Key. Access denied.',
        });
      }

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
      }

      const formattedEmail = email.toLowerCase().trim();
      const passwordHash = hashPassword(password);

      // Check if user exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', formattedEmail)
        .single();

      let superAdminUser;
      if (existing) {
        // Promote existing user to super_admin
        const { data, error } = await supabase
          .from('profiles')
          .update({
            role: 'super_admin',
            password_hash: passwordHash,
            full_name: full_name ? full_name.trim() : existing.full_name,
          })
          .eq('email', formattedEmail)
          .select('id, email, full_name, role, avatar_url, created_at')
          .single();

        if (error) throw error;
        superAdminUser = data;
      } else {
        // Create new super_admin
        const { data, error } = await supabase
          .from('profiles')
          .insert([{
            email: formattedEmail,
            full_name: full_name ? full_name.trim() : 'Super Administrator',
            role: 'super_admin',
            password_hash: passwordHash,
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedEmail)}`,
            created_at: new Date().toISOString(),
          }])
          .select('id, email, full_name, role, avatar_url, created_at')
          .single();

        if (error) throw error;
        superAdminUser = data;
      }

      res.json({
        success: true,
        message: 'Super Admin account authenticated and authorized in Supabase!',
        data: {
          user: superAdminUser,
          token: 'sa-token-' + superAdminUser.id,
        },
      });
    } catch (err) {
      console.error('claimSuperAdmin error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
