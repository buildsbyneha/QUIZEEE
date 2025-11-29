// src/components/Leaderboard/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { leaderboardService } from '../../services/leaderboardService';
import StreakDisplay from './StreakDisplay';
import Loader from '../Common/Loader';
import './Leaderboard.css';

function Leaderboard() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardService.getLeaderboard('weekly', 50);
      setRankings(response.rankings);
      
      // Find current user's rank
      const currentUserRank = response.rankings.find(r => r.user_id === user.id);
      setUserRank(currentUserRank);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  if (loading) {
    return <Loader message="Loading leaderboard..." />;
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">🏆 Leaderboard</h1>
        <p className="leaderboard-subtitle">Compete with fellow learners</p>
      </div>

      {userRank && (
        <div className="user-rank-card">
          <div className="user-rank-badge">
            <span className="rank-position">#{userRank.rank}</span>
            <span className="rank-label">Your Rank</span>
          </div>
          <div className="user-rank-details">
            <div className="rank-detail-item">
              <span className="rank-detail-label">Points</span>
              <span className="rank-detail-value">{userRank.total_points}</span>
            </div>
            <div className="rank-detail-item">
              <span className="rank-detail-label">Exams</span>
              <span className="rank-detail-value">{userRank.total_exams}</span>
            </div>
          </div>
          <StreakDisplay streak={userRank.current_streak} />
        </div>
      )}

      {rankings.length === 0 ? (
        <div className="leaderboard-empty">
          <p>No rankings yet. Be the first to complete an exam!</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="table-header">
            <span className="col-rank">Rank</span>
            <span className="col-name">Name</span>
            <span className="col-points">Points</span>
            <span className="col-exams">Exams</span>
            <span className="col-streak">Streak</span>
          </div>

          {rankings.map((entry) => {
            const isCurrentUser = entry.user_id === user.id;
            const medal = getMedalEmoji(entry.rank);

            return (
              <div
                key={entry.user_id}
                className={`table-row ${isCurrentUser ? 'current-user' : ''}`}
              >
                <span className="col-rank">
                  {medal ? (
                    <span className="medal">{medal}</span>
                  ) : (
                    `#${entry.rank}`
                  )}
                </span>
                <span className="col-name">
                  {entry.name}
                  {isCurrentUser && <span className="you-badge">You</span>}
                </span>
                <span className="col-points">{entry.total_points}</span>
                <span className="col-exams">{entry.total_exams}</span>
                <span className="col-streak">
                  <StreakDisplay streak={entry.current_streak} compact />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;