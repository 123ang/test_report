import api from './api';

export const projectService = {
  async getAll() {
    const res = await api.get('/projects');
    return res.data;
  },
  async getById(id) {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  async create(data) {
    const res = await api.post('/projects', data);
    return res.data;
  },
  async update(id, data) {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },
  async remove(id) {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
  async addMember(projectId, email) {
    const res = await api.post(`/projects/${projectId}/members`, { email });
    return res.data;
  },
  async removeMember(projectId, memberId) {
    const res = await api.delete(`/projects/${projectId}/members/${memberId}`);
    return res.data;
  },
};
