import api from './api';

// Get current user profile
export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Update password
export const updatePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.put('/users/password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

// Upload avatar
export const uploadAvatar = async (formData) => {
  const response = await api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete avatar
export const deleteAvatar = async () => {
  const response = await api.delete('/users/avatar');
  return response.data;
};

// Delete account
export const deleteAccount = async () => {
  const response = await api.delete('/users/account');
  return response.data;
};

// Update notification settings
export const updateNotificationSettings = async (settings) => {
  const response = await api.put('/users/settings/notifications', settings);
  return response.data;
};

// Get user settings
export const getSettings = async () => {
  const response = await api.get('/users/settings');
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  deleteAvatar,
  deleteAccount,
  updateNotificationSettings,
  getSettings
};