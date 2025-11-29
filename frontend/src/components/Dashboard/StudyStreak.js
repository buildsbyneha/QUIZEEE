// src/components/Dashboard/StudyStreak.js
import React, { useState, useEffect } from 'react';
import './StudyStreak.css';

function StudyStreak() {
  const [streak, setStreak] = useState(5); // Mock data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [completedDays, setCompletedDays] = useState([true, true, true, true, true, false, false]);

  return (
    <div className="study-streak">
      <div className="streak-header">
        <div className="streak-flame-large">
          <span className="flame-emoji">🔥</span>
          <span className="streak-count-large">{streak}</span>
        </div>
        <div className="streak-info">
          <h3 className="streak-title">Day Study Streak!</h3>
          <p className="streak-subtitle">Keep it up! Practice daily to maintain your streak</p>
        </div>
      </div>
      
      <div className="streak-calendar">
        {days.map((day, index) => (
          <div key={index} className={`streak-day ${completedDays[index] ? 'completed' : ''}`}>
            <span className="day-label">{day}</span>
            <div className="day-indicator">
              {completedDays[index] ? '✓' : '○'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudyStreak;