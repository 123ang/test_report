import api from './api';

export const dashboardService = {
  async getSummary(params) {
    const response = await api.get('/dashboard/summary', { params });
    return response.data;
  },

  async getTrends(days = 30) {
    const response = await api.get('/dashboard/trends', { params: { days } });
    return response.data;
  },

  async getByApp() {
    const response = await api.get('/dashboard/by-app');
    return response.data;
  },

  async getRecent(limit = 10, lang = 'en') {
    const response = await api.get('/dashboard/recent', { params: { limit, lang } });
    return response.data;
  }
};
