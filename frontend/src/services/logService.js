import api from './api';

// Get today's medicines with log status
export const getTodayMedicines = async (date) => {
  const dateParam = date || new Date().toISOString();
  const response = await api.get(`/logs/today?date=${dateParam}`);
  return response.data;
};

// Log a medicine (taken or missed)
export const logMedicine = async (medicineId, { status, timing, notes }) => {
  const response = await api.post('/logs', {
    medicineId,
    status,
    timing,
    notes,
    takenAt: new Date().toISOString()
  });
  return response.data;
};

// Get log history with date range
export const getLogHistory = async (startDate, endDate) => {
  const response = await api.get('/logs/history', {
    params: { startDate, endDate }
  });
  return response.data;
};

// Get logs for a specific medicine
export const getMedicineLogs = async (medicineId) => {
  const response = await api.get(`/logs/medicine/${medicineId}`);
  return response.data;
};

// Update a log entry
export const updateLog = async (logId, data) => {
  const response = await api.put(`/logs/${logId}`, data);
  return response.data;
};

// Delete a log entry
export const deleteLog = async (logId) => {
  const response = await api.delete(`/logs/${logId}`);
  return response.data;
};

// Get weekly summary
export const getWeeklySummary = async () => {
  const response = await api.get('/logs/summary/weekly');
  return response.data;
};

export default {
  getTodayMedicines,
  logMedicine,
  getLogHistory,
  getMedicineLogs,
  updateLog,
  deleteLog,
  getWeeklySummary
};