// src/components/Dashboard/FeatureBox.js
import React from 'react';
import './FeatureBox.css';

function FeatureBox({ title, description, icon, color, onClick }) {
  return (
    <div 
      className="feature-box" 
      onClick={onClick}
      style={{ '--feature-color': color }}
    >
      <div className="feature-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      <button className="feature-button">Start Now →</button>
    </div>
  );
}

export default FeatureBox;