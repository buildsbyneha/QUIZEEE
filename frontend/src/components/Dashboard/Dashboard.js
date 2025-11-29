// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { progressService } from '../../services/progressService';
import FeatureBox from './FeatureBox';
import QuickStats from './QuickStats';
import RecentActivity from './RecentActivity';
import StudyStreak from './StudyStreak';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchData();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const fetchData = async () => {
    try {
      const [profileData, progressData] = await Promise.all([
        profileService.getProfile(),
        progressService.getAnalytics('7days')
      ]);
      
      setProfile(profileData.profile);
      setStats(progressData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      id: 'main-exam',
      title: 'Main Exam',
      description: 'Full-length practice exams with detailed analytics',
      icon: '📝',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      route: '/exam/setup?type=MAIN_EXAM',
      stats: stats?.examsCompleted || 0
    },
    {
      id: 'mock-test',
      title: 'Mock Test',
      description: 'Simulate real exam environment and build confidence',
      icon: '🎯',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
      route: '/exam/setup?type=MOCK_TEST',
      stats: 'Timed'
    },
    {
      id: 'quick-quiz',
      title: 'Quick Quiz',
      description: 'Short topic-based quizzes for rapid learning',
      icon: '⚡',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      route: '/exam/setup?type=QUIZ',
      stats: '5-10 mins'
    },
    {
      id: 'pyq',
      title: 'Previous Year',
      description: 'Practice with authentic past exam papers',
      icon: '📚',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      route: '/pyq',
      stats: 'PYQ Bank'
    },
    {
      id: 'topic-wise',
      title: 'Topic Practice',
      description: 'Master specific topics with focused questions',
      icon: '🎓',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      route: '/exam/setup?type=TOPIC',
      stats: 'Custom'
    },
    {
      id: 'favorites',
      title: 'My Favorites',
      description: 'Revisit and practice your saved questions',
      icon: '⭐',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      route: '/favorites',
      stats: 'Saved'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-animation">
          <div className="spinner-large"></div>
          <p>Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <h1 className="hero-greeting">
            {greeting}, <span className="hero-name">{user?.name}!</span> 👋
          </h1>
          <p className="hero-subtitle">
            {profile?.target_exam 
              ? `Ready to ace ${profile.target_exam}? Let's practice!` 
              : 'Your personalized learning journey starts here'}
          </p>
          
          {stats && (
            <div className="hero-quick-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">{stats.totalQuestions || 0}</span>
                <span className="hero-stat-label">Questions</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">{stats.accuracy || 0}%</span>
                <span className="hero-stat-label">Accuracy</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">{stats.examsCompleted || 0}</span>
                <span className="hero-stat-label">Exams</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Study Streak */}
      <StudyStreak />

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Quick Access */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">🚀</span>
              Quick Start
            </h2>
            <p className="section-subtitle">Choose your practice mode</p>
          </div>
          
          <div className="features-grid modern">
            {features.map(feature => (
              <FeatureBox
                key={feature.id}
                {...feature}
                onClick={() => navigate(feature.route)}
              />
            ))}
          </div>
        </section>

        {/* Stats Overview */}
        {stats && (
          <section className="dashboard-section">
            <QuickStats stats={stats} />
          </section>
        )}

        {/* Recent Activity */}
        <section className="dashboard-section">
          <RecentActivity />
        </section>

        {/* Profile CTA */}
        {!profile?.target_exam && (
          <section className="dashboard-section">
            <div className="profile-cta">
              <div className="cta-content">
                <h3 className="cta-title">Complete Your Profile</h3>
                <p className="cta-description">
                  Set your target exam and study preferences to get personalized recommendations
                </p>
                <button 
                  className="cta-button"
                  onClick={() => navigate('/profile')}
                >
                  Setup Profile →
                </button>
              </div>
              <div className="cta-illustration">
                <span className="cta-emoji">🎯</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Dashboard;