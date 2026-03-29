import api from "./api";

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data.data; // { user, token }
};

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data.data; // { user, token }
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data.data; // { user }
};

export const googleAuth = async (credential) => {
  const res = await api.post("/auth/google", { credential });
  return res.data.data; // { user, token }
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPasswordService = async ({ email, otp, newPassword }) => {
  const res = await api.post("/auth/reset-password", { email, otp, newPassword });
  return res.data;
};
