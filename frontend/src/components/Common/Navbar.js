// src/components/Common/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Quizee</span>
        </Link>

        <div className="navbar-links">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/progress" 
            className={`nav-link ${isActive('/progress') ? 'active' : ''}`}
          >
            Progress
          </Link>
          <Link 
            to="/leaderboard" 
            className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
          >
            Leaderboard
          </Link>
        </div>

        <div className="navbar-user">
          <button 
            className="user-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <span className="user-name">{user?.name}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <Link 
                to="/profile" 
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <span className="dropdown-icon">👤</span>
                Profile
              </Link>
              <button 
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                <span className="dropdown-icon">🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;