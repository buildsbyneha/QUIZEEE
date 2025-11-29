// src/components/Dashboard/RecentActivity.js
import React, { useState, useEffect } from 'react';
import { progressService } from '../../services/progressService';
import './RecentActivity.css';

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const data = await progressService.getProgress();
      setActivities(data.recentSessions || []);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score, totalQuestions) => {
    const percentage = (score / (totalQuestions * 4)) * 100;
    if (percentage >= 75) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="recent-activity">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">📝</span>
            Recent Activity
          </h2>
        </div>
        <div className="activity-loading">Loading...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="recent-activity">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">📝</span>
            Recent Activity
          </h2>
        </div>
        <div className="activity-empty">
          <span className="empty-icon">📭</span>
          <p>No recent activity yet. Start practicing to see your history!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <div className="section-header">
        <h2 className="section-title">
          <span className="title-icon">📝</span>
          Recent Activity
        </h2>
        <p className="section-subtitle">Your last 5 practice sessions</p>
      </div>
      
      <div className="activity-list">
        {activities.slice(0, 5).map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">
              <span>{activity.subject === 'Biology' ? '🧬' : 
                     activity.subject === 'Physics' ? '⚛️' :
                     activity.subject === 'Chemistry' ? '🧪' :
                     activity.subject === 'Mathematics' ? '📐' : '📚'}</span>
            </div>
            <div className="activity-content">
              <h4 className="activity-title">{activity.exam_name}</h4>
              <p className="activity-meta">
                {activity.total_questions} questions • 
                {new Date(activity.end_time).toLocaleDateString()}
              </p>
            </div>
            <div 
              className="activity-score"
              style={{ color: getScoreColor(activity.total_score, activity.total_questions) }}
            >
              {activity.total_score} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;