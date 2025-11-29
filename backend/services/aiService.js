// backend/services/aiService.js
const axios = require('axios');

/**
 * Generate MCQs using OpenAI API with retry logic
 */
async function generateMCQsWithOpenAI({ examType, subject, topic, numQuestions, difficulty = 'MEDIUM' }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key not configured, using fallback questions');
    return null; // Will trigger fallback to question bank
  }

  const prompt = `Generate ${numQuestions} multiple choice questions for ${examType} exam preparation.

Subject: ${subject}
${topic ? `Topic: ${topic}` : ''}
Difficulty: ${difficulty}

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Include detailed explanations for correct answers
- Questions should be relevant to ${examType} exam pattern
- Mix of conceptual, application-based, and analytical questions
- Ensure questions are unique and non-repetitive

Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
[
  {
    "question": "Question text here",
    "options": {
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    },
    "correctAnswer": "A",
    "explanation": "Detailed explanation here",
    "difficulty": "${difficulty}",
    "tags": ["tag1", "tag2"]
  }
]`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert exam question generator. Always respond with valid JSON only, no additional text or markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const content = response.data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const questions = JSON.parse(jsonContent);

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid AI response format');
    }

    // Normalize structure to match database schema
    return questions.map(q => ({
      question_text: q.question,
      option_a: q.options.A,
      option_b: q.options.B,
      option_c: q.options.C,
      option_d: q.options.D,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || difficulty,
      tags: q.tags || [subject.toLowerCase(), topic?.toLowerCase()].filter(Boolean)
    }));

  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('AI service timeout - please try again');
    }
    
    if (error.response?.status === 429) {
      throw new Error('AI service rate limit exceeded - using question bank');
    }

    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key');
    }
    
    return null; // Will trigger fallback
  }
}

/**
 * Generate MCQs with automatic fallback
 */
async function generateMCQs(params) {
  // Try OpenAI first
  const aiQuestions = await generateMCQsWithOpenAI(params);
  
  if (aiQuestions && aiQuestions.length >= params.numQuestions) {
    console.log('✅ Generated questions using OpenAI');
    return aiQuestions;
  }

  // Fallback to question bank (handled in exams route)
  console.log('⚠️ Falling back to question bank');
  throw new Error('AI_FALLBACK_REQUIRED');
}

/**
 * Parse PDF and extract questions using AI
 */
async function parsePDFQuestions(pdfText, examType) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Extract all multiple choice questions from this ${examType} exam paper text and structure them as JSON.

Text:
${pdfText.substring(0, 12000)} // Limit to avoid token limits

Return ONLY a valid JSON array with this structure:
[
  {
    "question": "Question text",
    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
    "correctAnswer": "A",
    "explanation": "Explanation if available, or best guess"
  }
]`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting exam questions from text. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF questions');
  }
}

/**
 * Generate personalized study recommendations
 */
async function generateStudyRecommendations(userProgress) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getDefaultRecommendations(userProgress);
  }

  const prompt = `Based on this student's performance data, provide personalized study recommendations:

Weak Areas: ${userProgress.weakAreas.map(a => `${a.topic} (${a.accuracy}%)`).join(', ')}
Strong Areas: ${userProgress.strongAreas.map(a => `${a.topic} (${a.accuracy}%)`).join(', ')}
Total Exams: ${userProgress.totalExams}
Overall Accuracy: ${userProgress.overallAccuracy}%

Provide 5 specific, actionable recommendations in JSON format:
{
  "recommendations": [
    {
      "priority": "HIGH",
      "area": "Topic name",
      "suggestion": "Specific actionable advice",
      "resources": ["Resource 1", "Resource 2"]
    }
  ]
}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert educational advisor.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Recommendations error:', error);
    return getDefaultRecommendations(userProgress);
  }
}

function getDefaultRecommendations(userProgress) {
  return {
    recommendations: [
      {
        priority: 'HIGH',
        area: userProgress.weakAreas[0]?.topic || 'General',
        suggestion: 'Focus on practice questions in your weak areas',
        resources: ['Previous Year Questions', 'Topic-wise Tests']
      }
    ]
  };
}

module.exports = {
  generateMCQs,
  generateMCQsWithOpenAI,
  parsePDFQuestions,
  generateStudyRecommendations
};