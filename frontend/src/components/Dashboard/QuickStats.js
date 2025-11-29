// src/components/Dashboard/QuickStats.js
import React from 'react';
import './QuickStats.css';

function QuickStats({ stats }) {
  const statCards = [
    {
      label: 'Total Questions',
      value: stats.totalQuestions || 0,
      icon: '📊',
      color: '#6366f1',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Accuracy Rate',
      value: `${stats.accuracy || 0}%`,
      icon: '🎯',
      color: '#10b981',
      trend: '+5%',
      trendUp: true
    },
    {
      label: 'Exams Completed',
      value: stats.examsCompleted || 0,
      icon: '✅',
      color: '#8b5cf6',
      trend: '+3',
      trendUp: true
    },
    {
      label: 'Avg Time/Question',
      value: `${stats.avgTime || 0}s`,
      icon: '⏱️',
      color: '#f59e0b',
      trend: '-2s',
      trendUp: true
    }
  ];

  return (
    <div className="quick-stats">
      <div className="section-header">
        <h2 className="section-title">
          <span className="title-icon">📈</span>
          Your Performance
        </h2>
        <p className="section-subtitle">Last 7 days overview</p>
      </div>
      
      <div className="stats-grid-modern">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card-modern"
            style={{ '--card-color': stat.color }}
          >
            <div className="stat-icon-wrapper">
              <span className="stat-icon-modern">{stat.icon}</span>
            </div>
            <div className="stat-details">
              <span className="stat-label-modern">{stat.label}</span>
              <span className="stat-value-modern">{stat.value}</span>
              <span className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                {stat.trendUp ? '↗' : '↘'} {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickStats;