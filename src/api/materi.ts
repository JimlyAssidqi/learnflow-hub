import { Material } from "@/types";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface MateriData {
  mata_pelajaran_id: number;
  teacher_id: number;
  title: string;
  description: string;
  file: File;
}


export const tambahMateriApi = async (formData: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/api/materi`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const getMateriByMataPelajaranApi = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/api/materi/mata-pelajaran/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const hapusMateriApi = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/api/materi/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}