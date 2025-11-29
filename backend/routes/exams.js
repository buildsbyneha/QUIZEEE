// backend/routes/exams.js
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate exam with sample questions
router.post('/generate', authenticateToken, async (req, res) => {
  const { examType, subject, topic, numQuestions, durationMinutes, markingScheme } = req.body;

  if (!examType || !subject || !numQuestions) {
    return res.status(400).json({ 
      error: { message: 'examType, subject, and numQuestions are required', status: 400 } 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create exam record
    const examResult = await client.query(
      `INSERT INTO exams (user_id, exam_type, exam_name, subject, topic, total_questions, duration_minutes, marking_scheme, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE') RETURNING *`,
      [
        req.user.userId,
        examType,
        `${subject} - ${examType}`,
        subject,
        topic || null,
        numQuestions,
        durationMinutes || 60,
        markingScheme || { correct: 4, incorrect: -1, unanswered: 0 }
      ]
    );

    const exam = examResult.rows[0];

    // Generate sample questions (we'll replace this with AI later)
    const sampleQuestions = generateSampleQuestions(subject, numQuestions);
    
    const questionPromises = sampleQuestions.map(q =>
      client.query(
        `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [exam.exam_id, q.question, q.options.A, q.options.B, q.options.C, q.options.D, q.correctAnswer, q.explanation, q.difficulty, q.tags || []]
      )
    );

    const insertedQuestions = await Promise.all(questionPromises);

    await client.query('COMMIT');

    res.status(201).json({
      exam_id: exam.exam_id,
      exam,
      questions: insertedQuestions.map(r => r.rows[0])
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Exam generation error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to generate exam', status: 500 } 
    });
  } finally {
    client.release();
  }
});

// Helper function to generate sample questions
function generateSampleQuestions(subject, count) {
  const questions = [];
  const questionBank = {
    Biology: [
      {
        question: "Which organelle is known as the powerhouse of the cell?",
        options: { A: "Nucleus", B: "Mitochondria", C: "Ribosome", D: "Golgi apparatus" },
        correctAnswer: "B",
        explanation: "Mitochondria produce ATP through cellular respiration, providing energy for the cell.",
        difficulty: "EASY",
        tags: ["cell-biology", "organelles"]
      },
      {
        question: "What is the function of ribosomes?",
        options: { A: "Energy production", B: "Protein synthesis", C: "DNA replication", D: "Lipid storage" },
        correctAnswer: "B",
        explanation: "Ribosomes translate mRNA into proteins through the process of translation.",
        difficulty: "MEDIUM",
        tags: ["cell-biology", "protein-synthesis"]
      }
    ],
    Mathematics: [
      {
        question: "What is the value of π (pi) approximately?",
        options: { A: "3.14", B: "2.71", C: "1.41", D: "1.73" },
        correctAnswer: "A",
        explanation: "Pi (π) is approximately 3.14159, commonly rounded to 3.14.",
        difficulty: "EASY",
        tags: ["constants", "geometry"]
      },
      {
        question: "What is the derivative of x²?",
        options: { A: "x", B: "2x", C: "x²", D: "2x²" },
        correctAnswer: "B",
        explanation: "Using the power rule: d/dx(x²) = 2x¹ = 2x",
        difficulty: "MEDIUM",
        tags: ["calculus", "derivatives"]
      }
    ],
    Physics: [
      {
        question: "What is Newton's second law of motion?",
        options: { A: "F = ma", B: "E = mc²", C: "V = IR", D: "PV = nRT" },
        correctAnswer: "A",
        explanation: "Newton's second law states that Force equals mass times acceleration (F = ma).",
        difficulty: "EASY",
        tags: ["mechanics", "newton-laws"]
      }
    ],
    Chemistry: [
      {
        question: "What is the atomic number of Carbon?",
        options: { A: "4", B: "6", C: "8", D: "12" },
        correctAnswer: "B",
        explanation: "Carbon has 6 protons, giving it an atomic number of 6.",
        difficulty: "EASY",
        tags: ["periodic-table", "elements"]
      }
    ]
  };

  const subjectQuestions = questionBank[subject] || questionBank.Biology;
  
  for (let i = 0; i < count; i++) {
    questions.push(subjectQuestions[i % subjectQuestions.length]);
  }

  return questions;
}

// Get exam details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const examResult = await pool.query(
      'SELECT * FROM exams WHERE exam_id = $1 AND user_id = $2', 
      [req.params.id, req.user.userId]
    );

    if (examResult.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Exam not found', status: 404 } 
      });
    }

    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE exam_id = $1 ORDER BY question_id',
      [req.params.id]
    );

    res.json({
      exam: examResult.rows[0],
      questions: questionsResult.rows
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

// Submit exam
router.post('/:id/submit', authenticateToken, async (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ 
      error: { message: 'Invalid submission format', status: 400 } 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create session
    const sessionResult = await client.query(
      'INSERT INTO quiz_sessions (user_id, exam_id, status) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, req.params.id, 'COMPLETED']
    );
    const session = sessionResult.rows[0];

    // Get exam details
    const examResult = await client.query('SELECT * FROM exams WHERE exam_id = $1', [req.params.id]);
    const exam = examResult.rows[0];
    const markingScheme = exam.marking_scheme;

    let totalScore = 0;
    const analytics = { correct: 0, incorrect: 0, unanswered: 0 };
    const detailedResults = [];

    // Process each answer
    for (const answer of answers) {
      const questionResult = await client.query(
        'SELECT * FROM questions WHERE question_id = $1',
        [answer.questionId]
      );

      if (questionResult.rows.length === 0) continue;

      const question = questionResult.rows[0];
      const correctAnswer = question.correct_answer;
      const isCorrect = answer.selectedAnswer === correctAnswer;
      const isUnanswered = !answer.selectedAnswer;

      // Calculate score
      if (isUnanswered) {
        totalScore += markingScheme.unanswered;
        analytics.unanswered++;
      } else if (isCorrect) {
        totalScore += markingScheme.correct;
        analytics.correct++;
      } else {
        totalScore += markingScheme.incorrect;
        analytics.incorrect++;
      }

      // Save answer
      await client.query(
        'INSERT INTO user_answers (session_id, question_id, selected_answer, is_correct, time_taken_seconds) VALUES ($1, $2, $3, $4, $5)',
        [session.session_id, answer.questionId, answer.selectedAnswer, isCorrect, answer.timeTaken || 0]
      );

      detailedResults.push({
        questionId: question.question_id,
        questionText: question.question_text,
        yourAnswer: answer.selectedAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation,
        timeTaken: answer.timeTaken || 0
      });
    }

    // Update session score
    await client.query(
      'UPDATE quiz_sessions SET total_score = $1, end_time = NOW() WHERE session_id = $2', 
      [totalScore, session.session_id]
    );

    // Update leaderboard
    await client.query(
      `INSERT INTO leaderboard (user_id, total_points, total_exams)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         total_points = leaderboard.total_points + $2,
         total_exams = leaderboard.total_exams + 1,
         updated_at = NOW()`,
      [req.user.userId, Math.max(0, totalScore)]
    );

    await client.query('COMMIT');

    res.json({
      session_id: session.session_id,
      score: totalScore,
      analytics,
      percentage: ((analytics.correct / answers.length) * 100).toFixed(2),
      detailedResults
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit exam error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to submit exam', status: 500 } 
    });
  } finally {
    client.release();
  }
});

// Get user's exams
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, COUNT(q.question_id) as question_count
       FROM exams e
       LEFT JOIN questions q ON e.exam_id = q.exam_id
       WHERE e.user_id = $1
       GROUP BY e.exam_id
       ORDER BY e.created_at DESC`,
      [req.user.userId]
    );

    res.json({ exams: result.rows });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

module.exports = router;