import api from './api';

export const testRunService = {
  async getTestRuns(params) {
    const response = await api.get('/test-runs', { params });
    return response.data;
  },

  async getTestRunById(id, lang = 'en') {
    const response = await api.get(`/test-runs/${id}`, { params: { lang } });
    return response.data;
  },

  async createTestRun(data) {
    const response = await api.post('/test-runs', data);
    return response.data;
  },

  async updateTestRun(id, data) {
    const response = await api.put(`/test-runs/${id}`, data);
    return response.data;
  },

  async uploadScreenshots(testRunId, files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('screenshots', file);
    });

    const response = await api.post(`/test-runs/${testRunId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
