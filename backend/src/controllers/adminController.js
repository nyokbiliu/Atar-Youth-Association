const { pool } = require('../config/database');

// GET DASHBOARD STATISTICS
const getDashboardStats = async (req, res) => {
  try {
    const [
      // User stats
      [userStats], 
      // County distribution
      [countyDist], 
      // Issue stats
      [issueStats],
      // News stats
      [newsStats],
      // Activity stats
      [activityStats],
      // Recent issues
      recentIssues,
      // Recent users
      recentUsers
    ] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) AS total_users,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_users,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive_users,
          SUM(CASE WHEN role = 'officer' THEN 1 ELSE 0 END) AS officers
        FROM users
      `),
      
      pool.query(`
        SELECT county, COUNT(*) AS count 
        FROM profiles 
        GROUP BY county 
        ORDER BY count DESC 
        LIMIT 5
      `),
      
      pool.query(`
        SELECT 
          COUNT(*) AS total_issues,
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_issues,
          SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) AS reviewing_issues,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_issues
        FROM issues
      `),
      
      pool.query(`
        SELECT 
          COUNT(*) AS total_news,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published_news
        FROM news
      `),
      
      pool.query(`
        SELECT 
          COUNT(*) AS total_activities,
          SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) AS ongoing_activities
        FROM activities
      `),
      
      pool.query(`
        SELECT i.id, i.description, i.location, i.status, i.created_at, 
               it.type_name, u.full_name AS reporter
        FROM issues i
        LEFT JOIN issue_types it ON i.issue_type_id = it.id
        LEFT JOIN profiles u ON i.user_id = u.user_id
        ORDER BY i.created_at DESC
        LIMIT 5
      `),
      
      pool.query(`
        SELECT u.id, u.email, u.phone, u.status, u.created_at, 
               p.full_name, p.county, p.payam
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.role = 'user'
        ORDER BY u.created_at DESC
        LIMIT 5
      `)
    ]);

    res.json({
      success: true,
      stats: {
        users: userStats[0],
        counties: countyDist,
        issues: issueStats[0],
        news: newsStats[0],
        activities: activityStats[0],
        recent_issues: recentIssues,
        recent_users: recentUsers
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data' });
  }
};

// GET ALL USERS FOR MANAGEMENT
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.email, u.phone, u.role, u.status, u.created_at, u.last_login_at,
             p.full_name, p.gender, p.date_of_birth, p.county, p.payam, p.bio
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// UPDATE USER STATUS (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    
    // Log action
    await pool.query(
      'INSERT INTO approval_logs (user_id, action, approved_by, notes) VALUES (?, ?, ?, ?)',
      [userId, status === 'active' ? 'approved' : 'rejected', req.user.id, `Status changed to ${status}`]
    );
    
    res.json({ success: true, message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

module.exports = { getDashboardStats, getUsers, updateUserStatus };