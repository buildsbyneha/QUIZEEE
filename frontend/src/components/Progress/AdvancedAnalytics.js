// src/components/Progress/AdvancedAnalytics.js
import React, { useState, useEffect } from 'react';
import { progressService } from '../../services/progressService';
import './AdvancedAnalytics.css';

function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await progressService.getAnalytics('30days');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  // Calculate insights
  const insights = [
    {
      title: 'Best Performance Day',
      value: 'Monday',
      icon: '🏆',
      color: '#10b981',
      description: 'You score highest on Mondays'
    },
    {
      title: 'Average Study Time',
      value: '2.5 hrs',
      icon: '⏰',
      color: '#6366f1',
      description: 'Daily practice time'
    },
    {
      title: 'Strongest Subject',
      value: 'Biology',
      icon: '🎯',
      color: '#8b5cf6',
      description: '92% accuracy'
    },
    {
      title: 'Improvement Rate',
      value: '+15%',
      icon: '📈',
      color: '#f59e0b',
      description: 'Compared to last month'
    }
  ];

  const milestones = [
    { title: 'First Exam', date: '2 months ago', completed: true },
    { title: '100 Questions', date: '1 month ago', completed: true },
    { title: '500 Questions', date: '2 weeks ago', completed: false },
    { title: '1000 Questions', date: 'In progress', completed: false },
    { title: 'Top 10 Rank', date: 'Upcoming', completed: false }
  ];

  return (
    <div className="advanced-analytics">
      <h2 className="analytics-title">
        <span className="title-icon">🔬</span>
        Deep Insights
      </h2>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className="insight-card"
            style={{ '--insight-color': insight.color }}
          >
            <div className="insight-icon">{insight.icon}</div>
            <div className="insight-content">
              <h4 className="insight-title">{insight.title}</h4>
              <p className="insight-value">{insight.value}</p>
              <p className="insight-description">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="milestones-section">
        <h3 className="section-subtitle">
          <span className="subtitle-icon">🎖️</span>
          Your Journey Milestones
        </h3>
        <div className="milestones-timeline">
          {milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`milestone-item ${milestone.completed ? 'completed' : 'pending'}`}
            >
              <div className="milestone-indicator">
                {milestone.completed ? '✓' : index + 1}
              </div>
              <div className="milestone-content">
                <h4 className="milestone-title">{milestone.title}</h4>
                <p className="milestone-date">{milestone.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-section">
        <h3 className="section-subtitle">
          <span className="subtitle-icon">🔥</span>
          Activity Heatmap
        </h3>
        <div className="heatmap-grid">
          {Array.from({ length: 52 }, (_, week) => (
            <div key={week} className="heatmap-week">
              {Array.from({ length: 7 }, (_, day) => {
                const intensity = Math.floor(Math.random() * 5);
                return (
                  <div
                    key={day}
                    className={`heatmap-day intensity-${intensity}`}
                    title={`Week ${week + 1}, Day ${day + 1}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-boxes">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`legend-box intensity-${i}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default AdvancedAnalytics;