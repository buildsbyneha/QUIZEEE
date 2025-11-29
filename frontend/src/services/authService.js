// src/services/authService.js
import api from './api';

export const authService = {
  async signup(userData) {
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};