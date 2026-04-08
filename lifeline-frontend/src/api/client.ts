import axios from 'axios';

// 서버 공통 응답 규격
export interface CommonResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  data: T;
}

const client = axios.create({
  // 접속한 환경이 localhost(웹)면 서버 주소로, 아니면 안드로이드 에뮬레이터 주소로 설정
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8080'  // 웹 브라우저에서 실행 중일 때
    : 'http://10.0.2.2:8080',  // 안드로이드 에뮬레이터에서 실행 중일 때
  headers: {
    'Content-Type': 'application/json',
  },
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