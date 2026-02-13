import api from './api';

// Get all medicines
export const getMedicines = async () => {
  const response = await api.get('/medicines');
  return response.data;
};

// Get single medicine
export const getMedicine = async (id) => {
  const response = await api.get(`/medicines/${id}`);
  return response.data;
};

// Create new medicine
export const createMedicine = async (medicineData) => {
  const response = await api.post('/medicines', medicineData);
  return response.data;
};

// Update medicine
export const updateMedicine = async (id, medicineData) => {
  const response = await api.put(`/medicines/${id}`, medicineData);
  return response.data;
};

// Delete medicine
export const deleteMedicine = async (id) => {
  const response = await api.delete(`/medicines/${id}`);
  return response.data;
};

// Get active medicines
export const getActiveMedicines = async () => {
  const response = await api.get('/medicines?status=active');
  return response.data;
};

// Get completed medicines
export const getCompletedMedicines = async () => {
  const response = await api.get('/medicines?status=completed');
  return response.data;
};

export default {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getActiveMedicines,
  getCompletedMedicines
};