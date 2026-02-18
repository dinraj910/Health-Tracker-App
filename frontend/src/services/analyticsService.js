import api from './api';

// Get comprehensive analytics
export const getAnalytics = async (period = 'week') => {
  const response = await api.get(`/analytics?period=${period}`);
  return response.data;
};

// Get weekly stats for chart
export const getWeeklyStats = async () => {
  const response = await api.get('/analytics/weekly');
  return response.data;
};

// Get monthly stats
export const getMonthlyStats = async (month, year) => {
  const response = await api.get('/analytics/monthly', {
    params: { month, year }
  });
  return response.data;
};

// Get adherence rate
export const getAdherenceRate = async (days = 30) => {
  const response = await api.get('/analytics/adherence', {
    params: { days }
  });
  return response.data;
};

// Get per-medicine stats
export const getMedicineStats = async (days = 30) => {
  const response = await api.get('/analytics/medicines', {
    params: { days }
  });
  return response.data;
};

// Get streak info
export const getStreakInfo = async () => {
  const response = await api.get('/analytics/streak');
  return response.data;
};

// Get dashboard summary
export const getDashboardSummary = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

// Get time-based analysis
export const getTimeAnalysis = async () => {
  const response = await api.get('/analytics/time-analysis');
  return response.data;
};

// Get vitals trends (BP, heart rate, weight, blood sugar, SpO2)
export const getVitalsTrends = async (days = 7) => {
  const response = await api.get('/analytics/vitals', { params: { days } });
  return response.data;
};

// Get wellness trends (mood, sleep, stress, energy, water, steps)
export const getWellnessTrends = async (days = 7) => {
  const response = await api.get('/analytics/wellness', { params: { days } });
  return response.data;
};

export default {
  getAnalytics,
  getWeeklyStats,
  getMonthlyStats,
  getAdherenceRate,
  getMedicineStats,
  getStreakInfo,
  getDashboardSummary,
  getTimeAnalysis,
  getVitalsTrends,
  getWellnessTrends,
};