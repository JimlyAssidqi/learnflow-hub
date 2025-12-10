import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface MataPelajaranData {
  mata_pelajaran: string;
}

export const tambahMataPelajaranApi = async (data: MataPelajaranData) => {
  try {
    const response = await axios.post(`${API_URL}/api/mata-pelajaran`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const ubahMataPelajaranApi = async (id: number, data: MataPelajaranData) => {
  try {
    const response = await axios.put(`${API_URL}/api/mata-pelajaran/${id}`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const hapusMataPelajaranApi = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/api/mata-pelajaran/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const getMataPelajaranApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/mata-pelajaran`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}