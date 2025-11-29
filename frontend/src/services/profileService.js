// src/services/profileService.js
import api from './api';

export const profileService = {
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/profile', profileData);
    return response.data;
  }
};