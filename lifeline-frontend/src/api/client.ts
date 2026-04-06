import axios from 'axios';

// 서버 공통 응답 규격
export interface CommonResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  data: T;
}

const client = axios.create({
  baseURL: 'http://localhost:8080/api', // 프록시 설정에 따라 조절
  headers: { 'Content-Type': 'application/json' },
});

//토근 주입
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;