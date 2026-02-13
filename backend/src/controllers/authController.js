require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const registerUser = async (req, res) => {
  try {
    const { email, phone, password, full_name, gender, date_of_birth, county, payam } = req.body;

    // Validate required fields
    if (!email || !phone || !password || !full_name || !gender || !date_of_birth || !county || !payam) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or phone already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with pending approval status
    const [result] = await pool.query(
      'INSERT INTO users (email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
      [email, phone, passwordHash, 'user', 'pending_approval']
    );

    const userId = result.insertId;

    // Create profile
    await pool.query(
      'INSERT INTO profiles (user_id, full_name, gender, date_of_birth, county, payam) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, full_name, gender, date_of_birth, county, payam]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful. Please wait for admin approval.',
      userId 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [email, email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = users[0];

    // Check approval status
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is not approved yet. Please wait for admin approval.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        phone: user.phone 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Update last login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

module.exports = { registerUser, loginUser };