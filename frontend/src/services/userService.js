import api from './api';

// Get current user profile
export const getProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/user/profile', profileData);
  return response.data;
};

// Update password
export const updatePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.put('/user/password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

// Upload avatar
export const uploadAvatar = async (formData) => {
  const response = await api.put('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete avatar
export const deleteAvatar = async () => {
  const response = await api.delete('/user/avatar');
  return response.data;
};

// Delete account
export const deleteAccount = async () => {
  const response = await api.delete('/user/account');
  return response.data;
};

// Update notification settings
export const updateNotificationSettings = async (settings) => {
  const response = await api.put('/user/settings/notifications', settings);
  return response.data;
};

// Get user settings
export const getSettings = async () => {
  const response = await api.get('/user/settings');
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