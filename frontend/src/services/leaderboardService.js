// src/services/leaderboardService.js
import api from './api';

export const leaderboardService = {
  async getLeaderboard(type = 'weekly', limit = 50) {
    const response = await api.get('/leaderboard', { 
      params: { type, limit } 
    });
    return response.data;
  }
};