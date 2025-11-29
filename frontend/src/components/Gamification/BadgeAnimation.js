// src/components/Gamification/BadgeAnimation.js
import React from 'react';
import './BadgeAnimation.css';

function BadgeAnimation({ badge }) {
  const getBadgeIcon = (type) => {
    const icons = {
      CIRCLE: '⭕',
      SQUARE: '⬛',
      STAR: '⭐',
      TROPHY: '🏆'
    };
    return icons[type] || '🎖️';
  };

  return (
    <div className="badge-animation-overlay">
      <div className="badge-animation-content">
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        
        <div className="badge-popup">
          <div className="badge-icon-huge">
            {getBadgeIcon(badge.badge_type)}
          </div>
          <h2 className="badge-congratulations">Congratulations!</h2>
          <h3 className="badge-title">{badge.badge_name}</h3>
          <p className="badge-message">{badge.description}</p>
          <p className="badge-reward">+{badge.points} points earned!</p>
        </div>
      </div>
    </div>
  );
}

export default BadgeAnimation;