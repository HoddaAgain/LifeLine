// src/api/authapi.ts
import client from './client';
// src/api/authapi.ts
import axios from 'axios';
import {type CommonResponse,type LoginResponse,type LoginRequest, type RegisterRequest } from '../types/index';

export const authapi = {
 
  login: (data: LoginRequest) => 
    axios.post<CommonResponse<LoginResponse>>('/api/auth/login', data),
    
  register: (data: RegisterRequest) => 
    axios.post<CommonResponse<void>>('/api/auth/register', data),
};