import api from './api';

export const csvService = {
  async downloadTemplate() {
    const response = await api.get('/csv/template', {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'test-case-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async importTestCases(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/csv/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async exportTestCases() {
    const response = await api.get('/csv/export/test-cases', {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `test-cases-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportTestRuns(lang = 'en') {
    const response = await api.get('/csv/export/test-runs', {
      params: { lang },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `test-runs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
