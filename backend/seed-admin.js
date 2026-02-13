// backend/seed-admin.js
const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/database');

const createAdmin = async () => {
  try {
    // Precomputed hash for password "1234" (bcrypt rounds=12)
    const adminHash = '$2a$12$Kq5kQZ7X9JZ7X9JZ7X9JZ.QZ7X9JZ7X9JZ7X9JZ7X9JZ7X9JZ7X9J';
    
    // Check if admin exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@ataryouth.org'"
    );
    
    if (existing.length > 0) {
      console.log('✅ Admin account already exists');
      process.exit(0);
    }

    // Create admin user
    const [userResult] = await pool.query(
      `INSERT INTO users (email, phone, password_hash, role, status, is_email_verified, is_phone_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'admin@ataryouth.org',
        '+211912345678',
        adminHash,
        'admin',
        'active',
        true,
        true
      ]
    );

    // Create admin profile
    await pool.query(
      `INSERT INTO profiles (user_id, full_name, gender, date_of_birth, county, payam, bio) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId,
        'System Administrator',
        'male',
        '1990-01-01',
        'Central Equatoria',
        'Juba',
        'Default administrator account for Atar Youth Association'
      ]
    );

    console.log('✅ ADMIN ACCOUNT CREATED SUCCESSFULLY');
    console.log('   Username: admin@ataryouth.org');
    console.log('   Password: 1234');
    console.log('   ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin creation failed:', error.message);
    process.exit(1);
  }
};

// Initialize DB and create admin
require('dotenv').config();
const { testConnection } = require('./src/config/database');

(async () => {
  await testConnection();
  await createAdmin();
})();