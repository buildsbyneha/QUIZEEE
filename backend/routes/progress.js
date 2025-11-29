// backend/routes/progress.js
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user progress
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get quiz sessions with scores
    const sessionsResult = await pool.query(
      `SELECT qs.*, e.exam_name, e.subject, e.total_questions
       FROM quiz_sessions qs
       JOIN exams e ON qs.exam_id = e.exam_id
       WHERE qs.user_id = $1 AND qs.status = 'COMPLETED'
       ORDER BY qs.end_time DESC
       LIMIT 10`,
      [req.user.userId]
    );

    // Get subject-wise performance
    const subjectPerformance = await pool.query(
      `SELECT 
         e.subject,
         COUNT(DISTINCT qs.session_id) as attempts,
         AVG(qs.total_score) as avg_score,
         SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(ua.answer_id) as accuracy
       FROM quiz_sessions qs
       JOIN exams e ON qs.exam_id = e.exam_id
       LEFT JOIN user_answers ua ON qs.session_id = ua.session_id
       WHERE qs.user_id = $1 AND qs.status = 'COMPLETED'
       GROUP BY e.subject`,
      [req.user.userId]
    );

    // Get weak areas (topics with <70% accuracy)
    const weakAreas = await pool.query(
      `SELECT 
         q.tags[1] as topic,
         COUNT(*) as attempted,
         SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as accuracy
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.question_id
       JOIN quiz_sessions qs ON ua.session_id = qs.session_id
       WHERE qs.user_id = $1 AND q.tags IS NOT NULL AND array_length(q.tags, 1) > 0
       GROUP BY q.tags[1]
       HAVING SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*) < 70
       ORDER BY accuracy ASC
       LIMIT 5`,
      [req.user.userId]
    );

    res.json({
      recentSessions: sessionsResult.rows,
      subjectPerformance: subjectPerformance.rows,
      weakAreas: weakAreas.rows
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

// Get analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const period = req.query.period || '30days';
    
    // Calculate date range
    let dateFilter = '';
    if (period === '7days') {
      dateFilter = "AND qs.end_time >= NOW() - INTERVAL '7 days'";
    } else if (period === '30days') {
      dateFilter = "AND qs.end_time >= NOW() - INTERVAL '30 days'";
    }

    // Total stats
    const statsResult = await pool.query(
      `SELECT 
         COUNT(DISTINCT qs.session_id) as total_exams,
         COUNT(ua.answer_id) as total_questions,
         SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(ua.answer_id), 0) as accuracy,
         AVG(ua.time_taken_seconds) as avg_time
       FROM quiz_sessions qs
       LEFT JOIN user_answers ua ON qs.session_id = ua.session_id
       WHERE qs.user_id = $1 AND qs.status = 'COMPLETED' ${dateFilter}`,
      [req.user.userId]
    );

    // Performance over time
    const performanceResult = await pool.query(
      `SELECT 
         DATE(qs.end_time) as date,
         AVG(qs.total_score) as avg_score
       FROM quiz_sessions qs
       WHERE qs.user_id = $1 AND qs.status = 'COMPLETED' ${dateFilter}
       GROUP BY DATE(qs.end_time)
       ORDER BY date ASC`,
      [req.user.userId]
    );

    // Subject-wise accuracy
    const subjectAccuracyResult = await pool.query(
      `SELECT 
         e.subject,
         SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(ua.answer_id) as accuracy
       FROM quiz_sessions qs
       JOIN exams e ON qs.exam_id = e.exam_id
       JOIN user_answers ua ON qs.session_id = ua.session_id
       WHERE qs.user_id = $1 AND qs.status = 'COMPLETED' ${dateFilter}
       GROUP BY e.subject`,
      [req.user.userId]
    );

    res.json({
      totalQuestions: parseInt(statsResult.rows[0]?.total_questions) || 0,
      accuracy: parseFloat(statsResult.rows[0]?.accuracy).toFixed(1) || 0,
      examsCompleted: parseInt(statsResult.rows[0]?.total_exams) || 0,
      avgTime: parseInt(statsResult.rows[0]?.avg_time) || 0,
      charts: {
        performance: {
          labels: performanceResult.rows.map(r => r.date),
          data: performanceResult.rows.map(r => parseFloat(r.avg_score))
        },
        subjectAccuracy: {
          labels: subjectAccuracyResult.rows.map(r => r.subject),
          data: subjectAccuracyResult.rows.map(r => parseFloat(r.accuracy))
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

module.exports = router;