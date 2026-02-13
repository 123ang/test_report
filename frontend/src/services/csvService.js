import api from './api';

export const csvService = {
  async exportTestCases(params = {}) {
    const res = await api.get('/csv/export', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `test-cases-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  async importTestCases(versionId, file) {
    const text = await file.text();
    const res = await api.post(`/csv/import?versionId=${versionId}`, text, {
      headers: { 'Content-Type': 'text/csv' },
    });
    return res.data;
  },
  async downloadTemplate() {
    const res = await api.get('/csv/template', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'test-case-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
