import api from './api';

export const testCaseService = {
  async getTestCases(params) {
    const response = await api.get('/test-cases', { params });
    return response.data;
  },

  async getTestCaseById(id, lang = 'en') {
    const response = await api.get(`/test-cases/${id}`, { params: { lang } });
    return response.data;
  },

  async createTestCase(data) {
    const response = await api.post('/test-cases', data);
    return response.data;
  },

  async updateTestCase(id, data) {
    const response = await api.put(`/test-cases/${id}`, data);
    return response.data;
  },

  async deleteTestCase(id) {
    const response = await api.delete(`/test-cases/${id}`);
    return response.data;
  }
};
