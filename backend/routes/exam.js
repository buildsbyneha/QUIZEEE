// Add this to backend/routes/exams.js after the existing imports

// Update the generate endpoint to use question bank
router.post('/generate', authenticateToken, async (req, res) => {
  const { examType, subject, topic, numQuestions, durationMinutes, markingScheme, useQuestionBank = true } = req.body;

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

    let questions = [];

    if (useQuestionBank) {
      // Fetch from question bank
      let query = 'SELECT * FROM question_bank WHERE subject = $1 AND is_active = true';
      const params = [subject];
      
      if (topic) {
        query += ' AND topic = $2';
        params.push(topic);
      }
      
      query += ' ORDER BY RANDOM() LIMIT $' + (params.length + 1);
      params.push(numQuestions);

      const bankResult = await client.query(query, params);
      
      if (bankResult.rows.length < numQuestions) {
        // Not enough questions in bank, supplement with AI or show error
        throw new Error(`Only ${bankResult.rows.length} questions available in question bank`);
      }

      questions = bankResult.rows;
    } else {
      // Use AI generation (existing code)
      questions = generateSampleQuestions(subject, numQuestions);
    }
    
    // Insert questions
    const questionPromises = questions.map(q =>
      client.query(
        `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          exam.exam_id, 
          q.question_text, 
          q.option_a, 
          q.option_b, 
          q.option_c, 
          q.option_d, 
          q.correct_answer, 
          q.explanation, 
          q.difficulty || 'MEDIUM', 
          q.tags || []
        ]
      )
    );

    const insertedQuestions = await Promise.all(questionPromises);

    await client.query('COMMIT');

    res.status(201).json({
      exam_id: exam.exam_id,
      exam,
      questions: insertedQuestions.map(r => r.rows[0]),
      source: useQuestionBank ? 'question_bank' : 'generated'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Exam generation error:', error);
    res.status(500).json({ 
      error: { message: error.message || 'Failed to generate exam', status: 500 } 
    });
  } finally {
    client.release();
  }
});