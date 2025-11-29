// src/components/Common/Button.js
import React from 'react';
import './Button.css';

function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  fullWidth = false,
  disabled = false,
  loading = false 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${disabled ? 'btn-disabled' : ''}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

export default Button;