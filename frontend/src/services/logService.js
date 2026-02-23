import api from './api';

// Get today's medicines with log status
export const getTodayMedicines = async (date) => {
  const dateParam = date || new Date().toISOString().split('T')[0];
  const response = await api.get(`/log/today?date=${dateParam}`);
  return response.data;
};

// Take a medicine
export const takeMedicine = async (medicineId, { scheduledTime, notes } = {}) => {
  const response = await api.post('/log/take', {
    medicineId,
    scheduledTime,
    notes,
    takenAt: new Date().toISOString()
  });
  return response.data;
};

// Miss a medicine
export const missMedicine = async (medicineId, { scheduledTime, reason } = {}) => {
  const response = await api.post('/log/miss', {
    medicineId,
    scheduledTime,
    reason
  });
  return response.data;
};

// Log a medicine (generic — delegates to take/miss)
export const logMedicine = async (medicineId, { status, scheduledTime, notes }) => {
  if (status === 'missed' || status === 'skipped') {
    return missMedicine(medicineId, { scheduledTime, reason: notes, status });
  }
  return takeMedicine(medicineId, { scheduledTime, notes });
};

// Get log history with date range
export const getLogHistory = async (startDate, endDate) => {
  const response = await api.get('/log/history', {
    params: { startDate, endDate }
  });
  return response.data;
};

// Get logs for a specific date
export const getLogsByDate = async (date) => {
  const response = await api.get(`/log/date/${date}`);
  return response.data;
};

// Update a log entry
export const updateLog = async (logId, data) => {
  const response = await api.put(`/log/${logId}`, data);
  return response.data;
};

// Delete a log entry
export const deleteLog = async (logId) => {
  const response = await api.delete(`/log/${logId}`);
  return response.data;
};

export default {
  getTodayMedicines,
  takeMedicine,
  missMedicine,
  logMedicine,
  getLogHistory,
  getLogsByDate,
  updateLog,
  deleteLog
};