import axios from 'axios';
import { getBaseURL } from './axios';

export interface CommonResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  data: T;
}

const client = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
