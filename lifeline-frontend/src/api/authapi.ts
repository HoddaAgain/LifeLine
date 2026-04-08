// src/api/authapi.ts
import client from './client'; // 설정해둔 axios 인스턴스 가져오기
import { type CommonResponse, type LoginResponse, type LoginRequest, type RegisterRequest } from '../types/index';

export const authapi = {
 
  login: (data: LoginRequest) => 
    client.post<CommonResponse<LoginResponse>>('api/auth/login', data),
    
  register: (data: RegisterRequest) => 
    client.post<CommonResponse<void>>('api/auth/register', data),
};