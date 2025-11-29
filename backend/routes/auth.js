// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, name, age } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ 
      error: { message: 'Email, password, and name are required', status: 400 } 
    });
  }

  if (password.length < 8) {
    return res.status(400).json({ 
      error: { message: 'Password must be at least 8 characters', status: 400 } 
    });
  }

  try {
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: { message: 'Email already registered', status: 409 } 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, age) VALUES ($1, $2, $3, $4) RETURNING user_id, email, name, age, created_at',
      [email, passwordHash, name, age || null]
    );

    const user = result.rows[0];

    // Create default profile
    await pool.query(
      'INSERT INTO user_profiles (user_id, interests) VALUES ($1, $2)',
      [user.user_id, []]
    );

    // Initialize leaderboard entry
    await pool.query(
      'INSERT INTO leaderboard (user_id) VALUES ($1)',
      [user.user_id]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        age: user.age
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: { message: 'Server error during signup', status: 500 } 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: { message: 'Email and password are required', status: 400 } 
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: { message: 'Invalid credentials', status: 401 } 
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ 
        error: { message: 'Invalid credentials', status: 401 } 
      });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        age: user.age
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: { message: 'Server error during login', status: 500 } 
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, email, name, age, created_at FROM users WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'User not found', status: 404 } 
      });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

module.exports = router;