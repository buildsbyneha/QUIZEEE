// src/services/examService.js
import api from './api';

export const examService = {
  async generateExam(examParams) {
    const response = await api.post('/exams/generate', examParams);
    return response.data;
  },

  async getExam(examId) {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  },

  async getUserExams() {
    const response = await api.get('/exams');
    return response.data;
  },

  async submitExam(examId, answers) {
    const response = await api.post(`/exams/${examId}/submit`, { answers });
    return response.data;
  }
};