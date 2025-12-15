import { ChatMessage } from "@/types";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;


export const sendMessageApi = async (data: ChatMessage) => {
  try {
    const response = await axios.post(`${API_URL}/api/diskusi`, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export const getMessageApi = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/api/diskusi/mata-pelajaran/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}
