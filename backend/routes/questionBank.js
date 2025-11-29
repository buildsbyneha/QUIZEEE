// backend/routes/questionBank.js
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get questions from bank
router.get('/questions', authenticateToken, async (req, res) => {
  const { subject, topic, difficulty, examType, limit = 50 } = req.query;

  try {
    let query = 'SELECT * FROM question_bank WHERE is_active = true';
    const params = [];
    let paramCount = 1;

    if (subject) {
      query += ` AND subject = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    if (topic) {
      query += ` AND topic = $${paramCount}`;
      params.push(topic);
      paramCount++;
    }

    if (difficulty) {
      query += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }

    if (examType) {
      query += ` AND exam_type = $${paramCount}`;
      params.push(examType);
      paramCount++;
    }

    query += ` ORDER BY RANDOM() LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json({ questions: result.rows });
  } catch (error) {
    console.error('Get question bank error:', error);
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
});

// Get PYQ papers
router.get('/pyq', authenticateToken, async (req, res) => {
  const { examType, subject, year } = req.query;

  try {
    let query = 'SELECT * FROM pyq_papers WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (examType) {
      query += ` AND exam_type = $${paramCount}`;
      params.push(examType);
      paramCount++;
    }

    if (subject) {
      query += ` AND subject = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    if (year) {
      query += ` AND year = $${paramCount}`;
      params.push(year);
      paramCount++;
    }

    query += ' ORDER BY year DESC, exam_type';

    const result = await pool.query(query, params);
    res.json({ papers: result.rows });
  } catch (error) {
    console.error('Get PYQ papers error:', error);
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
});

// Get question sets
router.get('/sets', authenticateToken, async (req, res) => {
  const { subject, difficulty } = req.query;

  try {
    let query = 'SELECT * FROM question_sets WHERE is_public = true';
    const params = [];
    let paramCount = 1;

    if (subject) {
      query += ` AND subject = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    if (difficulty) {
      query += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ sets: result.rows });
  } catch (error) {
    console.error('Get question sets error:', error);
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
});

// Get questions from a specific set
router.get('/sets/:setId/questions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT qb.* 
       FROM question_bank qb
       JOIN set_questions sq ON qb.bank_question_id = sq.bank_question_id
       WHERE sq.set_id = $1
       ORDER BY sq.question_order`,
      [req.params.setId]
    );

    res.json({ questions: result.rows });
  } catch (error) {
    console.error('Get set questions error:', error);
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
});

// Add question to favorites
router.post('/favorites', authenticateToken, async (req, res) => {
  const { bank_question_id, notes } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO favorite_questions (user_id, bank_question_id, notes)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, bank_question_id) DO UPDATE SET notes = $3
       RETURNING *`,
      [req.user.userId, bank_question_id, notes]
    );

    res.json({ favorite: result.rows[0] });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
});

// Get user favorites
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT qb.*, fq.notes, fq.created_at as favorited_at
       FROM question_bank qb
       JOIN favorite_questions fq ON qb.bank_question_id = fq.bank_question_id
       WHERE fq.user_id = $1
       ORDER BY fq.created_at DESC`,
      [req.user.userId]
    );

    res.json({ favorites: result.rows });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
});

// Get subjects list
router.get('/subjects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT subject FROM question_bank ORDER BY subject'
    );

    res.json({ subjects: result.rows.map(r => r.subject) });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
});

// Get topics by subject
router.get('/topics', authenticateToken, async (req, res) => {
  const { subject } = req.query;

  try {
    const result = await pool.query(
      'SELECT DISTINCT topic FROM question_bank WHERE subject = $1 AND topic IS NOT NULL ORDER BY topic',
      [subject]
    );

    res.json({ topics: result.rows.map(r => r.topic) });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ error: { message: 'Server error', status: 500 } });
  }
});

module.exports = router;