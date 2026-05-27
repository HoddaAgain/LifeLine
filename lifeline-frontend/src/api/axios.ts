import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { useUserStore } from '../store/useUserStore';

const ANDROID_NATIVE_API_URL = 'http://10.120.54.116:8080';
const WEB_LOCAL_API_URL = 'http://localhost:8080';
const DEVICE_LAN_API_URL = 'http://10.120.54.116:8080';

export const getBaseURL = () => {
  if (Capacitor.isNativePlatform()) {
    return ANDROID_NATIVE_API_URL;
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return WEB_LOCAL_API_URL;
  }

  return DEVICE_LAN_API_URL;
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
      window.location.href = '/auth?mode=login';
    }
    return Promise.reject(error);
  }
);

export default api;
