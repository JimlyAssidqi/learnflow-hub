import { UserForAdmin } from "@/types";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const ubahUserApi = async (id: number, data: Partial<UserForAdmin>) => {
  try {
    const response = await axios.put(`${API_URL}/users/${id}`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const hapusUserApi = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const getUserApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const getUserStudentApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/students`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const getUserByIdApi = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

