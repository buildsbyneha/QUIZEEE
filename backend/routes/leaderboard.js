// backend/routes/leaderboard.js
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const result = await pool.query(
      `SELECT 
         l.*,
         u.name,
         u.email,
         ROW_NUMBER() OVER (ORDER BY l.total_points DESC) as rank
       FROM leaderboard l
       JOIN users u ON l.user_id = u.user_id
       ORDER BY l.total_points DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ rankings: result.rows });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

module.exports = router;