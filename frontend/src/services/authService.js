import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Include cookies in requests
});

export const registerUser = async (data) => {
  const res = await api.post("/register", data);
  return res.data.data; // { user, token }
};

export const loginUser = async (data) => {
  const res = await api.post("/login", data);
  return res.data.data; // { user, token }
};

export const logoutUser = async () => {
  const res = await api.post("/logout");
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/me");
  return res.data.data; // { user }
};
