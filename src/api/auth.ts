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