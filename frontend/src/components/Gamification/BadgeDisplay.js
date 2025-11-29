// src/components/Gamification/BadgeDisplay.js
import React, { useState, useEffect } from 'react';
import { badgeService } from '../../services/badgeService';
import BadgeAnimation from './BadgeAnimation';
import './BadgeDisplay.css';

function BadgeDisplay() {
  const [badges, setBadges] = useState([]);
  const [unclaimedBadges, setUnclaimedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [claimedBadge, setClaimedBadge] = useState(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await badgeService.getBadges();
      const allBadges = response.badges || [];
      
      setBadges(allBadges);
      setUnclaimedBadges(allBadges.filter(b => b.earned_at && !b.is_claimed));
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBadge = async (badgeId) => {
    try {
      const response = await badgeService.claimBadge(badgeId);
      const badge = response.badge;
      
      setClaimedBadge(badge);
      setShowAnimation(true);
      
      // Update badges list
      setBadges(badges.map(b => 
        b.badge_id === badgeId ? { ...b, is_claimed: true } : b
      ));
      setUnclaimedBadges(unclaimedBadges.filter(b => b.badge_id !== badgeId));
      
      setTimeout(() => {
        setShowAnimation(false);
        setClaimedBadge(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to claim badge:', error);
      alert('Failed to claim badge');
    }
  };

  const getBadgeIcon = (type) => {
    const icons = {
      CIRCLE: '⭕',
      SQUARE: '⬛',
      STAR: '⭐',
      TROPHY: '🏆'
    };
    return icons[type] || '🎖️';
  };

  const earnedBadges = badges.filter(b => b.earned_at && b.is_claimed);
  const lockedBadges = badges.filter(b => !b.earned_at);

  if (loading) {
    return (
      <div className="badges-loading">
        <div className="spinner"></div>
        <p>Loading badges...</p>
      </div>
    );
  }

  return (
    <div className="badge-display">
      {unclaimedBadges.length > 0 && (
        <div className="unclaimed-section">
          <h3 className="section-title">🎉 New Badges Available!</h3>
          <div className="unclaimed-badges">
            {unclaimedBadges.map(badge => (
              <div key={badge.badge_id} className="badge-card unclaimed glow">
                <div className="badge-icon-large">
                  {getBadgeIcon(badge.badge_type)}
                </div>
                <h4 className="badge-name">{badge.badge_name}</h4>
                <p className="badge-description">{badge.description}</p>
                <p className="badge-points">+{badge.points} points</p>
                <button
                  className="claim-button"
                  onClick={() => handleClaimBadge(badge.badge_id)}
                >
                  Claim Badge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {earnedBadges.length > 0 && (
        <div className="earned-section">
          <h3 className="section-title">Your Earned Badges</h3>
          <div className="badges-grid">
            {earnedBadges.map(badge => (
              <div key={badge.badge_id} className="badge-card earned">
                <div className="badge-icon-large">
                  {getBadgeIcon(badge.badge_type)}
                </div>
                <h4 className="badge-name">{badge.badge_name}</h4>
                <p className="badge-description">{badge.description}</p>
                <p className="badge-earned-date">
                  Earned {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {lockedBadges.length > 0 && (
        <div className="locked-section">
          <h3 className="section-title">Locked Badges</h3>
          <div className="badges-grid">
            {lockedBadges.map(badge => (
              <div key={badge.badge_id} className="badge-card locked">
                <div className="badge-icon-large locked-icon">
                  🔒
                </div>
                <h4 className="badge-name">{badge.badge_name}</h4>
                <p className="badge-description">{badge.description}</p>
                <p className="badge-requirement">
                  {badge.points} points reward
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {earnedBadges.length === 0 && unclaimedBadges.length === 0 && (
        <div className="no-badges">
          <p>🚀 Start completing exams to earn badges!</p>
        </div>
      )}

      {showAnimation && claimedBadge && (
        <BadgeAnimation badge={claimedBadge} />
      )}
    </div>
  );
}

export default BadgeDisplay;