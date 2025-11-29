// backend/routes/profile.js
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT up.*, u.name, u.email, u.age 
       FROM user_profiles up
       JOIN users u ON up.user_id = u.user_id
       WHERE up.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Profile not found', status: 404 } 
      });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

// Update profile
router.put('/', authenticateToken, async (req, res) => {
  const { name, age, subject_preference, study_field, target_exam, interests } = req.body;

  try {
    // Update user table
    if (name || age) {
      await pool.query(
        'UPDATE users SET name = COALESCE($1, name), age = COALESCE($2, age), updated_at = NOW() WHERE user_id = $3',
        [name, age, req.user.userId]
      );
    }

    // Update profile table
    const result = await pool.query(
      `UPDATE user_profiles 
       SET subject_preference = COALESCE($1, subject_preference),
           study_field = COALESCE($2, study_field),
           target_exam = COALESCE($3, target_exam),
           interests = COALESCE($4, interests)
       WHERE user_id = $5
       RETURNING *`,
      [subject_preference, study_field, target_exam, interests, req.user.userId]
    );

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update profile', status: 500 } 
    });
  }
});

module.exports = router;