import api from './api';

// Get all medicines
export const getMedicines = async () => {
  const response = await api.get('/medicine/all');
  return response.data;
};

// Get single medicine
export const getMedicine = async (id) => {
  const response = await api.get(`/medicine/${id}`);
  return response.data;
};

// Create new medicine
export const createMedicine = async (medicineData) => {
  const response = await api.post('/medicine/create', medicineData);
  return response.data;
};

// Update medicine
export const updateMedicine = async (id, medicineData) => {
  const response = await api.put(`/medicine/${id}`, medicineData);
  return response.data;
};

// Delete medicine
export const deleteMedicine = async (id) => {
  const response = await api.delete(`/medicine/${id}`);
  return response.data;
};

// Get today's medicines
export const getTodayMedicines = async () => {
  const response = await api.get('/medicine/today');
  return response.data;
};

// Toggle medicine active/inactive
export const toggleMedicine = async (id) => {
  const response = await api.patch(`/medicine/${id}/toggle`);
  return response.data;
};

// Get active medicines
export const getActiveMedicines = async () => {
  const response = await api.get('/medicine/all?status=active');
  return response.data;
};

// Get completed medicines
export const getCompletedMedicines = async () => {
  const response = await api.get('/medicine/all?status=completed');
  return response.data;
};

export default {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getTodayMedicines,
  toggleMedicine,
  getActiveMedicines,
  getCompletedMedicines
};