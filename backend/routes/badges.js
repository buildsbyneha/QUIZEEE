// backend/routes/badges.js
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user badges
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, ub.earned_at, ub.is_claimed
       FROM badges b
       LEFT JOIN user_badges ub ON b.badge_id = ub.badge_id AND ub.user_id = $1
       ORDER BY b.points ASC`,
      [req.user.userId]
    );

    // Check for new badges
    await checkAndAwardBadges(req.user.userId);

    res.json({ badges: result.rows });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

// Claim badge
router.post('/claim', authenticateToken, async (req, res) => {
  const { badge_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_badges 
       SET is_claimed = true 
       WHERE user_id = $1 AND badge_id = $2 AND is_claimed = false
       RETURNING *`,
      [req.user.userId, badge_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Badge not found or already claimed', status: 404 } 
      });
    }

    const badgeResult = await pool.query(
      'SELECT * FROM badges WHERE badge_id = $1',
      [badge_id]
    );

    res.json({ 
      badge: badgeResult.rows[0],
      animation: { type: 'celebration', duration: 3000 }
    });
  } catch (error) {
    console.error('Claim badge error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

// Helper function to check and award badges
async function checkAndAwardBadges(userId) {
  const client = await pool.connect();
  
  try {
    // Get user stats
    const stats = await client.query(
      `SELECT COUNT(*) as total_exams
       FROM quiz_sessions
       WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    );
    
    const totalExams = parseInt(stats.rows[0].total_exams);
    
    // Check badge criteria
    if (totalExams >= 5) {
      await client.query(
        `INSERT INTO user_badges (user_id, badge_id)
         SELECT $1, badge_id FROM badges WHERE badge_name = 'First Steps'
         ON CONFLICT DO NOTHING`,
        [userId]
      );
    }
  } finally {
    client.release();
  }
}

module.exports = router;