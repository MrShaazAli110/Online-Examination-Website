import crypto from 'crypto';
import { supabase } from '../config/supabase.js';

const ADMIN_SECRET = process.env.ADMIN_EXAMINER_KEY || 'EXAM_ADMIN_2026';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(String(password || '')).digest('hex');
};

export const authController = {
  // POST /api/auth/register
  async register(req, res) {
    try {
      const { full_name, email, password, requested_role, admin_secret_key } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({
          success: false,
          message: 'Full name, email, and password are required',
        });
      }

      const formattedEmail = email.toLowerCase().trim();

      // Check if user already exists in Supabase
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', formattedEmail)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      // Role Enforcement:
      // Users are NEVER allowed to self-assign the examiner role.
      // An examiner role can ONLY be created if the correct admin authorization key is supplied.
      let assignedRole = 'student';
      if (requested_role === 'examiner') {
        if (!admin_secret_key || admin_secret_key.trim() !== ADMIN_SECRET) {
          return res.status(403).json({
            success: false,
            message: 'Invalid Admin Authorization Key. Only authorized administrators can create Examiner accounts.',
          });
        }
        assignedRole = 'examiner';
      }

      const passwordHash = hashPassword(password);
      const newProfile = {
        email: formattedEmail,
        full_name: full_name.trim(),
        role: assignedRole,
        password_hash: passwordHash,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedEmail)}`,
        created_at: new Date().toISOString(),
      };

      const { data: created, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select('id, email, full_name, role, avatar_url, created_at')
        .single();

      if (error) {
        console.error('Registration profile insert error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to create profile: ' + error.message });
      }

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user: created,
          token: 'token-' + created.id,
        },
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const formattedEmail = email.toLowerCase().trim();

      // Fetch user profile from Supabase
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', formattedEmail)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.',
        });
      }

      // Verify password
      const inputHash = hashPassword(password);
      if (user.password_hash && user.password_hash !== inputHash) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.',
        });
      }

      // Sanitize user object (omit password hash)
      const { password_hash, ...safeUser } = user;

      res.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user: safeUser,
          token: 'token-' + safeUser.id,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/admin/make-examiner
  // Admin-only endpoint to promote an existing candidate to examiner
  async makeExaminer(req, res) {
    try {
      const { email, admin_secret_key } = req.body;

      if (admin_secret_key !== ADMIN_SECRET) {
        return res.status(403).json({ success: false, message: 'Unauthorized. Invalid Admin Key.' });
      }

      if (!email) {
        return res.status(400).json({ success: false, message: 'Target email is required' });
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'examiner' })
        .eq('email', email.toLowerCase().trim())
        .select('id, email, full_name, role')
        .single();

      if (error) {
        return res.status(400).json({ success: false, message: 'Failed to promote: ' + error.message });
      }

      res.json({
        success: true,
        message: `User ${email} has been promoted to Examiner by Administrator.`,
        data,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/auth/profile
  async getProfile(req, res) {
    try {
      const email = req.query.email;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email required' });
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url, created_at')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
