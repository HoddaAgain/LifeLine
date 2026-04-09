import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type User } from '../types/index'; 

interface UserState {
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  setLogin: (userData: User, token: string) => void; // User 타입을 공통으로 사용
  setLogout: () => void;
  setUser: (user: User | null) => void;
}

// src/store/useUserStore.ts
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      hasCheckedIn: false,
      setHasCheckedIn: (val) => set({ hasCheckedIn: val }),
      setLogin: (userData, token) => {
        // persist가 자동으로 'user-storage'에 저장해주므로 수동 setItem은 삭제 가능
        set({ user: userData, accessToken: token, isLoggedIn: true });
      },
      setLogout: () => {
        set({ user: null, accessToken: null, isLoggedIn: false });
        localStorage.clear()
      },
      setUser: (user) => set({ user })
    }),
    { 
      name: 'user-storage', // 이 이름으로 로컬스토리지에 통합 저장됨
    }
  )
);