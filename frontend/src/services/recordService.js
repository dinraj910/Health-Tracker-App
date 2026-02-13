import api from './api';

// Get all medical records
export const getRecords = async (params = {}) => {
  const response = await api.get('/records', { params });
  return response.data;
};

// Get single record
export const getRecord = async (id) => {
  const response = await api.get(`/records/${id}`);
  return response.data;
};

// Upload a new medical record
export const uploadRecord = async (formData) => {
  const response = await api.post('/records', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update record details
export const updateRecord = async (id, data) => {
  const response = await api.put(`/records/${id}`, data);
  return response.data;
};

// Delete a record
export const deleteRecord = async (id) => {
  const response = await api.delete(`/records/${id}`);
  return response.data;
};

// Get records by type
export const getRecordsByType = async (type) => {
  const response = await api.get(`/records?type=${type}`);
  return response.data;
};

// Download record file
export const downloadRecord = async (id) => {
  const response = await api.get(`/records/${id}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

export default {
  getRecords,
  getRecord,
  uploadRecord,
  updateRecord,
  deleteRecord,
  getRecordsByType,
  downloadRecord
};