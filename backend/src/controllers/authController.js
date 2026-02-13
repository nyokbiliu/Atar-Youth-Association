const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { upload, handleUploadError } = require('../middleware/upload');
const { optimizeImage, cleanupOldImages } = require('../utils/imageOptimizer');
const fs = require('fs').promises;
require('dotenv').config();

// ========================================
// PROFILE FETCH (Existing - Enhanced)
// ========================================
const getProfile = async (req, res) => {
  try {
    const [userRows] = await pool.query(
      `SELECT u.id, u.email, u.role, u.phone, u.status, 
              p.full_name, p.gender, p.date_of_birth, p.county, p.payam, 
              p.bio, p.profile_photo_url
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRows[0];
    const firstName = user.full_name ? user.full_name.split(' ')[0] : 'User';
    const photoUrl = user.profile_photo_url 
      ? (user.profile_photo_url.startsWith('http') ? user.profile_photo_url : `/uploads${user.profile_photo_url}`)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=0ea5e9&color=fff&size=150`;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        firstName,
        profile: {
          fullName: user.full_name || 'User',
          gender: user.gender || 'prefer_not_to_say',
          dateOfBirth: user.date_of_birth,
          county: user.county || 'Unknown',
          payam: user.payam || 'Unknown',
          bio: user.bio || '',
          profilePhotoUrl: photoUrl
        }
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// ========================================
// REGISTER (Instant Activation - Existing)
// ========================================
const registerUser = async (req, res) => {
  try {
    const { email, phone, password, full_name, gender, date_of_birth, county, payam } = req.body;

    if (!email || !phone || !password || !full_name || !gender || !date_of_birth || !county || !payam) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // South Sudan phone validation
    if (!/^\+211\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid South Sudan phone format (+211XXXXXXXXX)' });
    }

    // Check existing user
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email or phone already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const passwordHash = await bcrypt.hash(password, salt);

    // CREATE USER WITH 'active' STATUS (NO APPROVAL)
    const [result] = await pool.query(
      'INSERT INTO users (email, phone, password_hash, role, status, is_email_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [email, phone, passwordHash, 'user', 'active', true]
    );

    const userId = result.insertId;

    // Create profile
    await pool.query(
      'INSERT INTO profiles (user_id, full_name, gender, date_of_birth, county, payam) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, full_name, gender, date_of_birth, county, payam]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful! Please login to continue.',
      redirect: '/login'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// ========================================
// LOGIN (With Profile Data - Existing)
// ========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Find user (match email OR phone)
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [email, email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    // Block inactive accounts
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated. Contact administrator.' 
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Update last login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    // Fetch profile data
    const [profileRows] = await pool.query(
      `SELECT full_name, profile_photo_url FROM profiles WHERE user_id = ?`,
      [user.id]
    );

    const profile = profileRows[0] || {};
    const firstName = profile.full_name ? profile.full_name.split(' ')[0] : 'User';
    const photoUrl = profile.profile_photo_url 
      ? (profile.profile_photo_url.startsWith('http') ? profile.profile_photo_url : `/uploads${profile.profile_photo_url}`)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=0ea5e9&color=fff&size=150`;

    res.json({ 
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName,
        profilePhotoUrl: photoUrl
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// ========================================
// UPDATE PROFILE (NEW - With Photo Handling)
// ========================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      full_name, gender, date_of_birth, county, payam, bio,
      phone, email 
    } = req.body;

    // Validate required fields
    if (!full_name || !gender || !date_of_birth || !county || !payam) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate South Sudan phone format if provided
    if (phone && !/^\+211\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid South Sudan phone format (+211XXXXXXXXX)' });
    }

    // Check email/phone uniqueness if changed
    if (email || phone) {
      let conditions = [];
      let params = [];
      
      if (email && email !== req.user.email) {
        conditions.push('(email = ? AND id != ?)');
        params.push(email, userId);
      }
      if (phone && phone !== req.user.phone) {
        conditions.push('(phone = ? AND id != ?)');
        params.push(phone, userId);
      }
      
      if (conditions.length > 0) {
        const [existing] = await pool.query(
          `SELECT id FROM users WHERE ${conditions.join(' OR ')}`,
          params
        );
        if (existing.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email or phone already in use by another account' 
          });
        }
      }
    }

    // Handle photo upload
    let photoUrls = null;
    if (req.file) {
      try {
        // Get current profile photo path for cleanup
        const [currentProfile] = await pool.query(
          'SELECT profile_photo_url FROM profiles WHERE user_id = ?',
          [userId]
        );
        
        // Optimize new image
        photoUrls = await optimizeImage(req.file.path, userId);
        
        // Cleanup old images ONLY if they are local paths (not external URLs)
        if (currentProfile[0]?.profile_photo_url && !currentProfile[0].profile_photo_url.startsWith('http')) {
          await cleanupOldImages(currentProfile[0].profile_photo_url);
        }
      } catch (err) {
        console.error('Photo processing error:', err);
        // Continue without photo update if processing fails
        console.warn('Profile photo update skipped due to processing error');
      }
    }

    // Update users table (contact info)
    if (phone || email) {
      const updates = [];
      const values = [];
      
      if (phone) {
        updates.push('phone = ?');
        values.push(phone);
      }
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }
      
      if (updates.length > 0) {
        values.push(userId);
        await pool.query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }
    }

    // Update profiles table
    const profileUpdate = {
      full_name: full_name.trim(),
      gender,
      date_of_birth,
      county: county.trim(),
      payam: payam.trim(),
      bio: bio ? bio.trim() : null
    };
    
    if (photoUrls?.originalUrl) {
      profileUpdate.profile_photo_url = photoUrls.originalUrl;
    }

    await pool.query(
      'UPDATE profiles SET ? WHERE user_id = ?',
      [profileUpdate, userId]
    );

    // Fetch updated profile
    const [updated] = await pool.query(
      `SELECT u.id, u.email, u.phone, u.role, 
              p.full_name, p.gender, p.date_of_birth, p.county, p.payam, 
              p.bio, p.profile_photo_url
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [userId]
    );

    const user = updated[0];
    const firstName = user.full_name.split(' ')[0];
    const finalPhotoUrl = user.profile_photo_url 
      ? (user.profile_photo_url.startsWith('http') ? user.profile_photo_url : `/uploads${user.profile_photo_url}`)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=0ea5e9&color=fff&size=150`;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName,
        profile: {
          fullName: user.full_name,
          gender: user.gender,
          dateOfBirth: user.date_of_birth,
          county: user.county,
          payam: user.payam,
          bio: user.bio || '',
          profilePhotoUrl: finalPhotoUrl
        }
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// ========================================
// UPDATE PASSWORD (NEW)
// ========================================
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current and new password required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    // Verify current password
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Prevent reusing same password
    const isSamePassword = await bcrypt.compare(newPassword, users[0].password_hash);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be different from current password' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ?, last_login_at = NULL WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({ 
      success: true, 
      message: 'Password updated successfully. Please login again.' 
    });

  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

// ========================================
// EXPORTS
// ========================================
module.exports = { 
  registerUser, 
  loginUser, 
  getProfile, 
  updateProfile, 
  updatePassword,
  upload, 
  handleUploadError 
};