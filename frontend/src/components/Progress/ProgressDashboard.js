// src/components/Progress/ProgressDashboard.js
import React, { useState, useEffect } from 'react';
import { progressService } from '../../services/progressService';
import { badgeService } from '../../services/badgeService';
import AnalyticsChart from './AnalyticsChart';
import AdvancedAnalytics from './AdvancedAnalytics';
import BadgeDisplay from '../Gamification/BadgeDisplay';
import Loader from '../Common/Loader';
import './ProgressDashboard.css';

function ProgressDashboard() {
  const [progressData, setProgressData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progress, analyticsData] = await Promise.all([
        progressService.getProgress(),
        progressService.getAnalytics(selectedPeriod)
      ]);
      
      setProgressData(progress);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your progress..." />;
  }

  return (
    <div className="progress-dashboard">
      <div className="progress-header">
        <h1 className="progress-title">Your Progress</h1>
        <div className="period-selector">
          <button
            className={`period-btn ${selectedPeriod === '7days' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('7days')}
          >
            7 Days
          </button>
          <button
            className={`period-btn ${selectedPeriod === '30days' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('30days')}
          >
            30 Days
          </button>
          <button
            className={`period-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {analytics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
              📊
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Questions</p>
              <p className="stat-value">{analytics.totalQuestions || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              ✅
            </div>
            <div className="stat-content">
              <p className="stat-label">Accuracy</p>
              <p className="stat-value">{analytics.accuracy || 0}%</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
              🎯
            </div>
            <div className="stat-content">
              <p className="stat-label">Exams Completed</p>
              <p className="stat-value">{analytics.examsCompleted || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              ⏱️
            </div>
            <div className="stat-content">
              <p className="stat-label">Avg. Time/Question</p>
              <p className="stat-value">{analytics.avgTime || 0}s</p>
            </div>
          </div>
        </div>
      )}

      {analytics?.charts && (
        <div className="charts-section">
          <div className="chart-container">
            <h3 className="chart-title">Performance Over Time</h3>
            <AnalyticsChart 
              data={analytics.charts.performance} 
              type="line" 
            />
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Subject-wise Accuracy</h3>
            <AnalyticsChart 
              data={analytics.charts.subjectAccuracy} 
              type="bar" 
            />
          </div>
        </div>
      )}

      {progressData?.weakAreas && progressData.weakAreas.length > 0 && (
        <div className="weak-areas-section">
          <h3 className="section-title">Focus Areas</h3>
          <p className="section-subtitle">
            Topics where you need more practice (below 70% accuracy)
          </p>
          <div className="weak-areas-grid">
            {progressData.weakAreas.map((area, idx) => (
              <div key={idx} className="weak-area-card">
                <div className="weak-area-header">
                  <span className="weak-area-topic">{area.topic}</span>
                  <span className="weak-area-accuracy">{Math.round(area.accuracy)}%</span>
                </div>
                <div className="weak-area-stats">
                  <span className="weak-area-count">
                    {area.attempted} questions attempted
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ 
                      width: `${area.accuracy}%`,
                      backgroundColor: area.accuracy < 50 ? '#ef4444' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {progressData?.subjectPerformance && progressData.subjectPerformance.length > 0 && (
        <div className="subject-performance-section">
          <h3 className="section-title">Subject Performance</h3>
          <div className="subject-performance-grid">
            {progressData.subjectPerformance.map((subject, idx) => (
              <div key={idx} className="subject-card">
                <h4 className="subject-name">{subject.subject}</h4>
                <div className="subject-stats">
                  <div className="subject-stat">
                    <span className="subject-stat-label">Attempts</span>
                    <span className="subject-stat-value">{subject.attempts}</span>
                  </div>
                  <div className="subject-stat">
                    <span className="subject-stat-label">Avg Score</span>
                    <span className="subject-stat-value">
                      {Math.round(subject.avg_score || 0)}
                    </span>
                  </div>
                  <div className="subject-stat">
                    <span className="subject-stat-label">Accuracy</span>
                    <span className="subject-stat-value">
                      {Math.round(subject.accuracy || 0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="dashboard-section">
        <AdvancedAnalytics />
      </section>

      <div className="badges-section">
        <h3 className="section-title">Your Achievements</h3>
        <BadgeDisplay />
      </div>
    </div>
  );
}

export default ProgressDashboard;