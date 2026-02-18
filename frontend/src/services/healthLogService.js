import api from './api';

// Create or update today's health log
export const saveHealthLog = async (data) => {
    const response = await api.post('/health-logs', data);
    return response.data;
};

// Get today's health log
export const getTodayLog = async () => {
    const response = await api.get('/health-logs/today');
    return response.data;
};

// Get health logs by date range
export const getHealthLogs = async (params = {}) => {
    const response = await api.get('/health-logs', { params });
    return response.data;
};

// Get a specific health log
export const getHealthLogById = async (id) => {
    const response = await api.get(`/health-logs/${id}`);
    return response.data;
};

// Update a health log
export const updateHealthLog = async (id, data) => {
    const response = await api.put(`/health-logs/${id}`, data);
    return response.data;
};

// Delete a health log
export const deleteHealthLog = async (id) => {
    const response = await api.delete(`/health-logs/${id}`);
    return response.data;
};

export default {
    saveHealthLog,
    getTodayLog,
    getHealthLogs,
    getHealthLogById,
    updateHealthLog,
    deleteHealthLog,
};
