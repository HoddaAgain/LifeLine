import axios from 'axios';
import { useUserStore } from '../store/useUserStore';

// 접속 환경에 따라 주소를 자동으로 선택하는 함수
const getBaseURL = () => {
  // 웹 브라우저(localhost)에서 접속 중일 때
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8080';
  }
  // 그 외(안드로이드 에뮬레이터 등) 환경일 때
  return 'http://10.0.2.2:8080';
};

const api = axios.create({
  baseURL: getBaseURL(), // 여기서 함수를 호출하여 주소를 결정합니다.
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터 부분은 기존과 동일하게 유지...
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
      console.error("인증 에러: 로그인이 만료되었습니다.");
    }
    return Promise.reject(error);
  }
);

export default api;