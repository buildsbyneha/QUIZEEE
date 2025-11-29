// src/services/badgeService.js
import api from './api';

export const badgeService = {
  async getBadges() {
    const response = await api.get('/badges');
    return response.data;
  },

  async claimBadge(badgeId) {
    const response = await api.post('/badges/claim', { badge_id: badgeId });
    return response.data;
  }
};