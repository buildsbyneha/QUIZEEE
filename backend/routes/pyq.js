// backend/routes/pyq.js
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { parsePDFQuestions } = require('../services/aiService');

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Upload and parse PYQ PDF
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      error: { message: 'No file uploaded', status: 400 } 
    });
  }

  const { examType, subject, year } = req.body;

  if (!examType || !subject) {
    return res.status(400).json({ 
      error: { message: 'examType and subject are required', status: 400 } 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Parse PDF
    console.log('📄 Parsing PDF...');
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    console.log('📝 Extracted text length:', pdfText.length);

    // Use AI to extract questions
    console.log('🤖 Using AI to extract questions...');
    let questions = [];
    
    try {
      questions = await parsePDFQuestions(pdfText, examType);
      console.log('✅ Extracted', questions.length, 'questions');
    } catch (aiError) {
      console.error('AI parsing failed:', aiError);
      return res.status(503).json({ 
        error: { 
          message: 'Failed to parse PDF. AI service may be unavailable.', 
          status: 503 
        } 
      });
    }

    if (questions.length === 0) {
      throw new Error('No questions could be extracted from the PDF');
    }

    // Create PYQ paper record
    const paperResult = await client.query(
      `INSERT INTO pyq_papers (exam_type, subject, year, paper_name, total_questions, duration_minutes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        examType,
        subject,
        year || new Date().getFullYear(),
        `${examType} ${subject} ${year || 'Custom'}`,
        questions.length,
        null
      ]
    );

    const paper = paperResult.rows[0];

    // Insert questions into question bank
    const insertedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      const questionResult = await client.query(
        `INSERT INTO question_bank 
         (subject, topic, difficulty, question_text, option_a, option_b, option_c, option_d, 
          correct_answer, explanation, exam_type, year, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [
          subject,
          null, // topic
          'MEDIUM', // default difficulty
          q.question || q.question_text,
          q.options?.A || q.option_a,
          q.options?.B || q.option_b,
          q.options?.C || q.option_c,
          q.options?.D || q.option_d,
          q.correctAnswer || q.correct_answer,
          q.explanation,
          examType,
          year || new Date().getFullYear(),
          `${examType} ${year || 'Custom'} (Uploaded)`
        ]
      );

      const insertedQ = questionResult.rows[0];
      insertedQuestions.push(insertedQ);

      // Link to PYQ paper
      await client.query(
        `INSERT INTO pyq_questions (paper_id, question_number, bank_question_id)
         VALUES ($1, $2, $3)`,
        [paper.paper_id, i + 1, insertedQ.bank_question_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'PDF parsed successfully',
      paper: paper,
      questions: insertedQuestions,
      count: insertedQuestions.length
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('PDF upload error:', error);
    res.status(500).json({ 
      error: { 
        message: error.message || 'Failed to process PDF', 
        status: 500 
      } 
    });
  } finally {
    client.release();
  }
});

// Get uploaded PYQ papers
router.get('/papers', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pyq_papers 
       ORDER BY year DESC, created_at DESC`
    );

    res.json({ papers: result.rows });
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

// Get questions from a PYQ paper
router.get('/papers/:paperId/questions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT qb.* 
       FROM question_bank qb
       JOIN pyq_questions pq ON qb.bank_question_id = pq.bank_question_id
       WHERE pq.paper_id = $1
       ORDER BY pq.question_number`,
      [req.params.paperId]
    );

    res.json({ questions: result.rows });
  } catch (error) {
    console.error('Get paper questions error:', error);
    res.status(500).json({ 
      error: { message: 'Server error', status: 500 } 
    });
  }
});

module.exports = router;