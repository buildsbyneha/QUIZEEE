// src/components/Exam/ResultsScreen.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../Common/Button';
import './ResultScreen.css';

function ResultsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const result = location.state?.result;

  useEffect(() => {
    if (!result) {
      navigate('/dashboard');
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const { score, analytics, percentage, detailedResults } = result;
  const totalQuestions = analytics.correct + analytics.incorrect + analytics.unanswered;

  const getScoreMessage = () => {
    const percent = parseFloat(percentage);
    if (percent >= 90) return { text: 'Outstanding! 🎉', color: '#10b981' };
    if (percent >= 75) return { text: 'Excellent Work! 🌟', color: '#3b82f6' };
    if (percent >= 60) return { text: 'Good Job! 👍', color: '#8b5cf6' };
    if (percent >= 40) return { text: 'Keep Practicing! 💪', color: '#f59e0b' };
    return { text: 'Need More Practice 📚', color: '#ef4444' };
  };

  const scoreMessage = getScoreMessage();

  return (
    <div className="results-container">
      <div className="results-header" style={{ '--header-color': scoreMessage.color }}>
        <div className="results-badge">
          <h1 className="results-title">{scoreMessage.text}</h1>
          <p className="results-subtitle">Here's how you performed</p>
        </div>
      </div>

      <div className="results-summary">
        <div className="score-card main-score">
          <div className="score-circle" style={{ '--score-color': scoreMessage.color }}>
            <svg className="score-ring" width="160" height="160">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="var(--score-color)"
                strokeWidth="12"
                strokeDasharray={`${(parseFloat(percentage) / 100) * 440} 440`}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="score-content">
              <span className="score-percentage">{percentage}%</span>
              <span className="score-label">Score</span>
            </div>
          </div>
          <div className="score-details">
            <div className="score-detail-item">
              <span className="detail-label">Total Marks</span>
              <span className="detail-value">{score}</span>
            </div>
            <div className="score-detail-item">
              <span className="detail-label">Questions</span>
              <span className="detail-value">{totalQuestions}</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card correct-stat">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <span className="stat-value">{analytics.correct}</span>
              <span className="stat-label">Correct</span>
            </div>
          </div>

          <div className="stat-card incorrect-stat">
            <div className="stat-icon">✗</div>
            <div className="stat-content">
              <span className="stat-value">{analytics.incorrect}</span>
              <span className="stat-label">Incorrect</span>
            </div>
          </div>

          <div className="stat-card unanswered-stat">
            <div className="stat-icon">○</div>
            <div className="stat-content">
              <span className="stat-value">{analytics.unanswered}</span>
              <span className="stat-label">Unanswered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detailed-results">
        <h2 className="section-title">Question-wise Analysis</h2>
        
        {detailedResults && detailedResults.map((item, index) => (
          <div key={item.questionId} className="result-item">
            <div className="result-item-header">
              <div className="result-item-title">
                <span className="result-question-number">Q{index + 1}</span>
                {item.isCorrect ? (
                  <span className="result-status correct">✓ Correct</span>
                ) : item.yourAnswer ? (
                  <span className="result-status incorrect">✗ Incorrect</span>
                ) : (
                  <span className="result-status unanswered">○ Unanswered</span>
                )}
              </div>
              <span className="result-time">⏱️ {item.timeTaken}s</span>
            </div>

            <p className="result-question-text">{item.questionText}</p>

            <div className="result-answers">
              <div className="answer-row">
                <span className="answer-label">Your Answer:</span>
                <span className={`answer-value ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                  {item.yourAnswer || 'Not Answered'}
                </span>
              </div>
              {!item.isCorrect && (
                <div className="answer-row">
                  <span className="answer-label">Correct Answer:</span>
                  <span className="answer-value correct">{item.correctAnswer}</span>
                </div>
              )}
            </div>

            {item.explanation && (
              <div className="result-explanation">
                <strong>Explanation:</strong> {item.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="results-actions">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button onClick={() => navigate('/exam/setup')}>
          Take Another Exam
        </Button>
        <Button variant="info" onClick={() => navigate('/progress')}>
          View Progress
        </Button>
      </div>
    </div>
  );
}

export default ResultsScreen;