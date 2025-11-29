// src/components/Exam/ExamSetup.js
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { examService } from '../../services/examService';
import Button from '../Common/Button';
import './ExamSetup.css';

function ExamSetup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examTypeParam = searchParams.get('type') || 'QUIZ';

  const [formData, setFormData] = useState({
    examType: examTypeParam,
    subject: '',
    topic: '',
    numQuestions: 10,
    durationMinutes: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subjects = [
    'Biology', 'Chemistry', 'Physics', 'Mathematics',
    'English', 'General Knowledge', 'History', 'Geography',
    'Economics', 'Political Science', 'Computer Science'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject) {
      setError('Please select a subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const examData = {
        examType: formData.examType,
        subject: formData.subject,
        topic: formData.topic || null,
        numQuestions: parseInt(formData.numQuestions),
        durationMinutes: parseInt(formData.durationMinutes),
        markingScheme: {
          correct: 4,
          incorrect: -1,
          unanswered: 0
        }
      };

      const response = await examService.generateExam(examData);
      navigate(`/exam/${response.exam_id}`);
    } catch (err) {
      setError(err.message || 'Failed to generate exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getExamTypeInfo = () => {
    const info = {
      MAIN_EXAM: {
        title: 'Main Exam',
        icon: '📝',
        description: 'Comprehensive full-length exam',
        color: '#6366f1'
      },
      MOCK_TEST: {
        title: 'Mock Test',
        icon: '🎯',
        description: 'Simulated exam environment',
        color: '#8b5cf6'
      },
      QUIZ: {
        title: 'Quick Quiz',
        icon: '⚡',
        description: 'Short topic-based quiz',
        color: '#ec4899'
      },
      TEST_MODULE: {
        title: 'Test Module',
        icon: '📖',
        description: 'Chapter-wise practice',
        color: '#f59e0b'
      }
    };
    return info[formData.examType] || info.QUIZ;
  };

  const examInfo = getExamTypeInfo();

  return (
    <div className="exam-setup-container">
      <div className="exam-setup-header" style={{ '--header-color': examInfo.color }}>
        <div className="exam-type-badge">
          <span className="exam-type-icon">{examInfo.icon}</span>
          <div>
            <h1 className="exam-type-title">{examInfo.title}</h1>
            <p className="exam-type-description">{examInfo.description}</p>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="exam-setup-form">
        <div className="form-section">
          <h3 className="section-title">Exam Configuration</h3>

          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              Subject <span className="required">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topic" className="form-label">
              Topic/Chapter (Optional)
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Cell Biology, Quadratic Equations"
              className="form-input"
            />
            <span className="form-hint">Leave empty for random questions from the subject</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numQuestions" className="form-label">
                Number of Questions
              </label>
              <input
                type="number"
                id="numQuestions"
                name="numQuestions"
                value={formData.numQuestions}
                onChange={handleChange}
                min="5"
                max="100"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="durationMinutes" className="form-label">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="durationMinutes"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                min="5"
                max="180"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="marking-scheme-info">
            <h4 className="info-title">Marking Scheme</h4>
            <div className="marking-details">
              <div className="marking-item">
                <span className="marking-icon correct">✓</span>
                <span>Correct Answer: +4 marks</span>
              </div>
              <div className="marking-item">
                <span className="marking-icon incorrect">✗</span>
                <span>Incorrect Answer: -1 mark</span>
              </div>
              <div className="marking-item">
                <span className="marking-icon unanswered">○</span>
                <span>Unanswered: 0 marks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {loading ? 'Generating...' : 'Generate Exam'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ExamSetup;