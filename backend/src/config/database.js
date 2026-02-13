require('dotenv').config(); // Load environment variables

const mysql = require('mysql2/promise');

// Validate database configuration
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('❌ Database configuration missing in .env file');
  console.error('Please ensure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME are set');
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+03:00' // East Africa Time (South Sudan)
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Test if database exists
    const [databases] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [process.env.DB_NAME]
    );

    if (databases.length === 0) {
      console.error(`❌ Database '${process.env.DB_NAME}' does not exist!`);
      console.error('Please create the database first using the SQL script from Step 1');
      connection.release();
      process.exit(1);
    }

    console.log('✅ Database connected successfully');
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    console.log(`👤 User: ${process.env.DB_USER}`);
    console.log(`📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
    
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   SQL State: ${error.sqlState}`);
    
    // Provide helpful hints
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Hint: Check your DB_USER and DB_PASSWORD in .env file');
      console.error('   Make sure the MySQL user has proper permissions');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Hint: MySQL server might not be running');
      console.error('   Start your MySQL service and try again');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Hint: Database does not exist');
      console.error('   Create the database using the SQL script from Step 1');
    }
    
    process.exit(1);
  }
};

module.exports = { pool, testConnection };