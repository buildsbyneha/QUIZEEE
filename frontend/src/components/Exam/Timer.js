// src/components/Exam/Timer.js
import React, { useState, useEffect } from 'react';
import './Timer.css';

function Timer({ durationMinutes, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isWarning = timeLeft <= 300; // Last 5 minutes
  const isCritical = timeLeft <= 60; // Last 1 minute

  return (
    <div className={`timer ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}>
      <span className="timer-icon">⏱️</span>
      <span className="timer-text">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default Timer;