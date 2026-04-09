import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type User } from '../types/index';

interface UserState {
  user: User | null;
  lastCheckInTime: string | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  hasCheckedIn: boolean;
  setHasCheckedIn: (val: boolean) => void;
  setLastCheckInTime: (time: string | null) => void;
  setLogin: (userData: User, token: string) => void;
  setLogout: () => void;
  setUser: (userOrUpdater: User | null | ((prev: User | null) => User | null)) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      lastCheckInTime: null, // 초기값 추가
      accessToken: null,
      isLoggedIn: false,
      hasCheckedIn: false,

      // 출석 상태 변경
      setHasCheckedIn: (val) => set({ hasCheckedIn: val }),

      // 마지막 출석 시간 저장
      setLastCheckInTime: (time) => set({ lastCheckInTime: time }),

      // 로그인 
      setLogin: (userData, token) => {
        set({
          user: userData,
          accessToken: token,
          isLoggedIn: true,
          hasCheckedIn: false,
          lastCheckInTime: null, 
        });
      },

      // 로그아웃 
      setLogout: () => {
        set({
          user: null,
          accessToken: null,
          isLoggedIn: false,
          hasCheckedIn: false,
          lastCheckInTime: null,
        });
      
        localStorage.removeItem('user-storage');
      },

      // 유저 정보 업데이트
      setUser: (userOrUpdater) =>
        set((state) => ({
          user:
            typeof userOrUpdater === 'function'
              ? userOrUpdater(state.user)
              : userOrUpdater,
        })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);