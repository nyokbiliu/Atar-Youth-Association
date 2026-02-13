const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/adminAuth');
const { getDashboardStats, getUsers, updateUserStatus } = require('../controllers/adminController');

// All admin routes require admin authentication
router.use(isAdmin);

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);

// Future endpoints (placeholder)
router.get('/issues', (req, res) => res.json({ success: true, message: 'Issues endpoint ready' }));
router.get('/news', (req, res) => res.json({ success: true, message: 'News endpoint ready' }));
router.get('/activities', (req, res) => res.json({ success: true, message: 'Activities endpoint ready' }));

module.exports = router;