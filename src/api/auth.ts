import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface LoginiData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export const registerUserApi = async (data: RegisterData) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/register`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const loginUserApi = async (data: LoginiData) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/login`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const forgotPasswordApi = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/forgot-password`, { email });
    return response.data;
  } catch (error) {
    return error.response?.data || { error: 'Terjadi kesalahan' };
  }
}

interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export const resetPasswordApi = async (data: ResetPasswordData) => {
  try {
    const response = await axios.post(`${API_URL}/api/reset-password`, data);
    return response.data;
  } catch (error) {
    return error.response?.data || { error: 'Terjadi kesalahan' };
  }
}