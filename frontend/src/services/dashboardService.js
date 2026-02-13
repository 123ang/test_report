import api from './api';

export const dashboardService = {
  async getSummary(projectId) {
    const params = {};
    if (projectId) params.projectId = projectId;
    const res = await api.get('/dashboard/summary', { params });
    return res.data;
  },
  async getTrends(days = 30, projectId) {
    const params = { days };
    if (projectId) params.projectId = projectId;
    const res = await api.get('/dashboard/trends', { params });
    return res.data;
  },
  async getByProject() {
    const res = await api.get('/dashboard/by-project');
    return res.data;
  },
  async getRecent(limit = 10, projectId) {
    const params = { limit };
    if (projectId) params.projectId = projectId;
    const res = await api.get('/dashboard/recent', { params });
    return res.data;
  },
};
