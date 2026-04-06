import api from './axios';
import { type Diary } from '../types'; // Diary 타입이 정의되어 있다고 가정합니다.

export const diaryApi = {
  // 모든 일기 가져오기
  getDiaries: () => api.get<Diary[]>('/api/diaries'),

  // 일기 작성
  createDiary: (data: { title: string; content: string; mood: string; createdat: string }) => 
    api.post<Diary>('/api/diaries', data),

  // 일기 수정 (필요 시)
  updateDiary: (id: number | string, data: Partial<Diary>) => 
    api.put<Diary>(`/api/diaries/${id}`, data),

  // 일기 삭제
  deleteDiary: (id: number | string) => 
    api.delete(`/api/diaries/${id}`)
};