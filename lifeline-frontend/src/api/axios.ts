import axios from 'axios';
import { useUserStore } from '../store/useUserStore';

const api = axios.create({
  // 백엔드 서버 주소 
  baseURL: 'http://localhost:8080', 
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
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      
      console.error("인증 에러: 로그인이 만료되었습니다.");
      // useUserStore.getState().setLogout(); 
    }
    return Promise.reject(error);
  }
);

export default api;