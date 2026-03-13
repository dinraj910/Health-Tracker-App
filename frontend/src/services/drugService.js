import api from './api';

// Search drugs by name
export const searchDrugs = async (query, limit = 20, skip = 0) => {
  const response = await api.get('/drugs/search', {
    params: { q: query, limit, skip },
  });
  return response.data;
};

// Get drug details by ID
export const getDrugDetails = async (id) => {
  const response = await api.get(`/drugs/${id}`);
  return response.data;
};

// Browse drugs by category
export const getDrugsByCategory = async (category, limit = 20) => {
  const response = await api.get(`/drugs/category/${encodeURIComponent(category)}`, {
    params: { limit },
  });
  return response.data;
};

export default { searchDrugs, getDrugDetails, getDrugsByCategory };
