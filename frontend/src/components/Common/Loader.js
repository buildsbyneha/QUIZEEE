// src/components/Common/Loader.js
import React from 'react';
import './Loader.css';

function Loader({ message = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loader-message">{message}</p>
    </div>
  );
}

export default Loader;