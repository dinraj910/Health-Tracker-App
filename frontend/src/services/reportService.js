import api from './api';

const API_URL = api.defaults.baseURL || '';

// Get AI-powered health summary (JSON)
export const getHealthSummary = async (days = 30) => {
  const response = await api.get('/reports/health-summary', { params: { days } });
  return response.data;
};

// Download health report as PDF
export const downloadHealthReport = async (days = 30) => {
  const response = await api.get('/reports/download-pdf', {
    params: { days },
    responseType: 'blob',
  });

  // Create download link
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `MediTrack_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default { getHealthSummary, downloadHealthReport };
