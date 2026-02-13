import api from './api';

export const versionService = {
  async getByProject(projectId) {
    const res = await api.get(`/versions/project/${projectId}`);
    return res.data;
  },
  async getById(id) {
    const res = await api.get(`/versions/${id}`);
    return res.data;
  },
  async create(data) {
    const res = await api.post('/versions', data);
    return res.data;
  },
  async update(id, data) {
    const res = await api.put(`/versions/${id}`, data);
    return res.data;
  },
  async remove(id) {
    const res = await api.delete(`/versions/${id}`);
    return res.data;
  },
};
