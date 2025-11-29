// src/components/Exam/QuizCard.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import Timer from './Timer';
import Button from '../Common/Button';
import './QuizCard.css';

function QuizCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    loadExam();
  }, [id]);

  useEffect(() => {
    // Reset timer when question changes
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const loadExam = async () => {
    try {
      const data = await examService.getExam(id);
      setExam(data.exam);
      setQuestions(data.questions);
      
      // Initialize answers object
      const initialAnswers = {};
      data.questions.forEach(q => {
        initialAnswers[q.question_id] = {
          selectedAnswer: null,
          timeTaken: 0
        };
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Failed to load exam:', error);
      alert('Failed to load exam. Please try again.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (option) => {
    if (showExplanation) return;

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setAnswers({
      ...answers,
      [currentQuestion.question_id]: {
        selectedAnswer: option,
        timeTaken
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const handleQuestionJump = (index) => {
    setCurrentIndex(index);
    setShowExplanation(false);
  };

  const handleSubmit = async () => {
    const unansweredCount = Object.values(answers).filter(a => !a.selectedAnswer).length;
    
    let confirmMessage = 'Are you sure you want to submit the exam?';
    if (unansweredCount > 0) {
      confirmMessage = `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`;
    }
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setSubmitting(true);

    try {
      const submissionData = Object.entries(answers).map(([questionId, data]) => ({
        questionId: parseInt(questionId),
        selectedAnswer: data.selectedAnswer,
        timeTaken: data.timeTaken
      }));

      const result = await examService.submitExam(id, submissionData);
      navigate(`/exam/${id}/results`, { state: { result } });
    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    alert('Time is up! Your exam will be submitted automatically.');
    handleSubmit();
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="spinner"></div>
        <p>Loading exam...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-error">
        <p>No questions found!</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const selectedAnswer = answers[currentQuestion.question_id]?.selectedAnswer;
  const isAnswered = selectedAnswer !== null;
  const answeredCount = Object.values(answers).filter(a => a.selectedAnswer !== null).length;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2 className="quiz-title">{exam.exam_name}</h2>
          <div className="quiz-meta">
            <span className="quiz-progress">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="quiz-separator">•</span>
            <span className="quiz-answered">
              Answered: {answeredCount}/{questions.length}
            </span>
          </div>
        </div>
        
        {exam.duration_minutes && (
          <Timer 
            durationMinutes={exam.duration_minutes} 
            onTimeUp={handleTimeUp}
          />
        )}
      </div>

      <div className="quiz-main">
        <div className="quiz-card">
          <div className="question-header">
            <span className="question-number">Question {currentIndex + 1}</span>
            {currentQuestion.difficulty && (
              <span className={`difficulty-badge ${currentQuestion.difficulty.toLowerCase()}`}>
                {currentQuestion.difficulty}
              </span>
            )}
          </div>

          <p className="question-text">{currentQuestion.question_text}</p>

          <div className="options-container">
            {['A', 'B', 'C', 'D'].map(option => {
              const optionText = currentQuestion[`option_${option.toLowerCase()}`];
              const isSelected = selectedAnswer === option;
              const isCorrect = currentQuestion.correct_answer === option;
              
              let optionClass = 'option-card';
              if (isSelected) optionClass += ' selected';
              if (showExplanation) {
                if (isCorrect) optionClass += ' correct';
                else if (isSelected && !isCorrect) optionClass += ' incorrect';
              }

              return (
                <div
                  key={option}
                  className={optionClass}
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className="option-letter">{option}</div>
                  <div className="option-text">{optionText}</div>
                  {showExplanation && isCorrect && (
                    <div className="option-indicator correct-indicator">✓</div>
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <div className="option-indicator incorrect-indicator">✗</div>
                  )}
                </div>
              );
            })}
          </div>

          {showExplanation && (
            <div className="explanation-box">
              <div className="explanation-header">
                {selectedAnswer === currentQuestion.correct_answer ? (
                  <span className="explanation-status correct-status">
                    ✓ Correct Answer!
                  </span>
                ) : (
                  <span className="explanation-status incorrect-status">
                    ✗ Incorrect Answer
                  </span>
                )}
              </div>
              <p className="explanation-text">{currentQuestion.explanation}</p>
              <p className="correct-answer-text">
                <strong>Correct Answer:</strong> {currentQuestion.correct_answer}
              </p>
            </div>
          )}

          <div className="quiz-actions">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              ← Previous
            </Button>

            <div className="middle-actions">
              {isAnswered && !showExplanation && (
                <Button
                  variant="info"
                  onClick={handleShowExplanation}
                >
                  Show Explanation
                </Button>
              )}
            </div>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
              >
                Next →
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmit}
                loading={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            )}
          </div>
        </div>

        <div className="question-navigator">
          <h4 className="navigator-title">Question Palette</h4>
          <div className="navigator-grid">
            {questions.map((q, idx) => {
              const isCurrentQuestion = idx === currentIndex;
              const isAnsweredQuestion = answers[q.question_id]?.selectedAnswer !== null;
              
              let navClass = 'nav-button';
              if (isCurrentQuestion) navClass += ' active';
              if (isAnsweredQuestion) navClass += ' answered';
              
              return (
                <button
                  key={q.question_id}
                  className={navClass}
                  onClick={() => handleQuestionJump(idx)}
                  title={`Question ${idx + 1}${isAnsweredQuestion ? ' (Answered)' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div className="navigator-legend">
            <div className="legend-item">
              <span className="legend-box answered"></span>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-box unanswered"></span>
              <span>Not Answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-box current"></span>
              <span>Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizCard;