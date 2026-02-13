import api from './api';

export const testCaseService = {
  async getAll(params) {
    const res = await api.get('/test-cases', { params });
    return res.data;
  },
  async getById(id) {
    const res = await api.get(`/test-cases/${id}`);
    return res.data;
  },
  async create(data) {
    const res = await api.post('/test-cases', data);
    return res.data;
  },
  async update(id, data) {
    const res = await api.put(`/test-cases/${id}`, data);
    return res.data;
  },
  async toggle(id, field) {
    const res = await api.patch(`/test-cases/${id}/toggle`, { field });
    return res.data;
  },
  async remove(id) {
    const res = await api.delete(`/test-cases/${id}`);
    return res.data;
  },
  async uploadImages(testCaseId, files) {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const res = await api.post(`/test-cases/${testCaseId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async deleteImage(imageId) {
    const res = await api.delete(`/test-cases/images/${imageId}`);
    return res.data;
  },
};
