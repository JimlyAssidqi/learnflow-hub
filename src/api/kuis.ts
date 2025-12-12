import { KuisData, Question, Quiz } from "@/types";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;



export const tambahKuisApi = async (data: Quiz) => {
  try {
    const response = await axios.post(`${API_URL}/api/kuis`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const getAllKuis = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/kuis`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const getKuisByGuru = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/kuis/guru/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const ubahKuisApi = async (id: string, data: Quiz) => {
  try {
    const response = await axios.put(`${API_URL}/api/kuis/${id}`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const deleteKuisApi = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/api/kuis/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const tambahSoalKuisApi = async (data: Question) => {
  try {
    const response = await axios.post(`${API_URL}/api/soal-kuis`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const getSoalBuKuis = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/soal-kuis/kuis/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const deleteSoalkuis = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/api/soal-kuis/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const ubahSoalKuisApi = async (id: string, data: Question) => {
  try {
    const response = await axios.put(`${API_URL}/api/soal-kuis/${id}`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}



export const jawabSoalKuis = async (data: { id_soal: number; id_siswa: number; jawaban_siswa: string }) => {
  try {
    const response = await axios.post(`${API_URL}/api/jawaban`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}