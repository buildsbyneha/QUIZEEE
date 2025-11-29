// src/services/progressService.js
import api from './api';

export const progressService = {
  async getProgress(subject) {
    const params = subject ? { subject } : {};
    const response = await api.get('/progress', { params });
    return response.data;
  },

  async getAnalytics(period = '30days') {
    const response = await api.get('/progress/analytics', { 
      params: { period } 
    });
    return response.data;
  }
};