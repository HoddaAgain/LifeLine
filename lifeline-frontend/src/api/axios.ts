import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { useUserStore } from '../store/useUserStore';

const WEB_LOCAL_API_URL = 'http://localhost:8080';
const ANDROID_EMULATOR_API_URL = 'http://10.0.2.2:8080';

export const getBaseURL = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (Capacitor.isNativePlatform()) {
    return import.meta.env.VITE_ANDROID_API_BASE_URL || ANDROID_EMULATOR_API_URL;
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return WEB_LOCAL_API_URL;
  }

  return `${window.location.protocol}//${window.location.hostname}:8080`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error: login has expired.');
      useUserStore.getState().setLogout();
      window.location.href = '/auth?mode=login';
    }
    return Promise.reject(error);
  }
);

export default api;
