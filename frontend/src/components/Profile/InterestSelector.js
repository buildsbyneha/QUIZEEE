// src/components/Profile/InterestSelector.js
import React, { useState } from 'react';
import './InterestSelector.css';

function InterestSelector({ interests, onChange }) {
  const [inputValue, setInputValue] = useState('');

  const suggestedInterests = [
    'Cell Biology', 'Genetics', 'Ecology', 'Human Anatomy',
    'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry',
    'Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics',
    'Algebra', 'Calculus', 'Geometry', 'Trigonometry',
    'Current Affairs', 'History', 'Geography', 'Economics',
    'English Literature', 'Grammar', 'Vocabulary'
  ];

  const handleAddInterest = (interest) => {
    if (interest && !interests.includes(interest)) {
      onChange([...interests, interest]);
      setInputValue('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    onChange(interests.filter(interest => interest !== interestToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest(inputValue);
    }
  };

  return (
    <div className="interest-selector">
      <div className="interest-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add your interests..."
          className="interest-input"
        />
        <button
          type="button"
          onClick={() => handleAddInterest(inputValue)}
          className="add-interest-button"
        >
          + Add
        </button>
      </div>

      {interests.length > 0 && (
        <div className="selected-interests">
          <p className="interests-label">Your Interests:</p>
          <div className="interests-tags">
            {interests.map((interest, index) => (
              <div key={index} className="interest-tag">
                <span className="interest-text">{interest}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="remove-interest-button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="suggested-interests">
        <p className="interests-label">Suggestions:</p>
        <div className="interests-tags">
          {suggestedInterests
            .filter(suggestion => !interests.includes(suggestion))
            .slice(0, 12)
            .map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAddInterest(suggestion)}
                className="suggested-tag"
              >
                + {suggestion}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default InterestSelector;