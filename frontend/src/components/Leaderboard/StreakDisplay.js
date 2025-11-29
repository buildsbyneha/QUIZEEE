// src/components/Leaderboard/StreakDisplay.js
import React from 'react';
import './StreakDisplay.css';

function StreakDisplay({ streak, compact = false }) {
  if (compact) {
    return (
      <div className="streak-compact">
        <span className="streak-icon">🔥</span>
        <span className="streak-count">{streak}</span>
      </div>
    );
  }

  return (
    <div className="streak-display">
      <div className="streak-flame">
        <span className="flame-icon">🔥</span>
      </div>
      <div className="streak-info">
        <span className="streak-number">{streak}</span>
        <span className="streak-label">Day Streak</span>
      </div>
    </div>
  );
}

export default StreakDisplay;