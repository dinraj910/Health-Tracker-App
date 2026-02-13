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
export const getAdherenceRate = async (startDate, endDate) => {
  const response = await api.get('/analytics/adherence', {
    params: { startDate, endDate }
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

export default {
  getAnalytics,
  getWeeklyStats,
  getMonthlyStats,
  getAdherenceRate,
  getStreakInfo,
  getDashboardSummary,
  getTimeAnalysis
};