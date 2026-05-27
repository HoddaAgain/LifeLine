import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Capacitor, registerPlugin } from '@capacitor/core';


import LottieComponent from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import kanaLottie from '../assets/kana.json'; 
import LogoImg from '../assets/Logo.png'; 

import DiaryWriteModal from '../components/DiaryWrite';
import DiaryDetailModal from '../components/DiaryDetail';
import { useDiary } from '../hooks/useDiary';
import { useUserStore } from '../store/useUserStore';
import api, { getBaseURL } from '../api/axios';

interface WidgetBridgePlugin {
  updateWidgetState(options: {
    token?: string | null;
    baseUrl: string;
    hasCheckedIn: boolean;
    survivalStreak: number;
    missionCompletedCount: number;
    missionTotalCount: number;
    lastUpdated?: string | null;
  }): Promise<void>;
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

const TabButton = ({ icon, label, active, onClick, isEasy }: any) => (
  <button onClick={onClick} className="flex-1 flex flex-col items-center group">
    <span className={`${isEasy ? 'text-3xl mb-1' : 'text-2xl mb-1'} transition-all ${active ? 'scale-110' : 'grayscale opacity-30'}`}>{icon}</span>
    <span className={`${isEasy ? 'text-xs' : 'text-[10px]'} font-black ${active ? 'text-[#1CB0F6]' : 'text-gray-400'}`}>{label}</span>
  </button>
);

const SettingRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-50 last:border-b-0">
    <span className="text-sm font-black text-gray-400">{label}</span>
    <span className="text-sm font-black text-gray-700 text-right truncate max-w-[190px]">
      {value || '등록되지 않음'}
    </span>
  </div>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  
  // Zustand Store
  const { 
    user, setUser, setLogout, 
    hasCheckedIn, setHasCheckedIn, 
    setLastCheckInTime,
    accessToken
  } = useUserStore();
  
  const isEasyMode = user?.mode === 'EASY';

 
  const Lottie = useMemo(() => {
    if (!LottieComponent) return null;
    return (LottieComponent as any).default || LottieComponent;
  }, []);

  // UI 상태 관리
  const [activeTab, setActiveTab] = useState<'main' | 'diary' | 'settings' | 'profile'>('main');
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [touchCount, setTouchCount] = useState(0);

  // 일기 검색 및 정렬 필터
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [selectedDate, setSelectedDate] = useState('');

  // 함수 시스템
  const [toasts, setToasts] = useState<any[]>([]);
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const handleLogout = useCallback(() => {
    if (Capacitor.isNativePlatform()) {
      WidgetBridge.updateWidgetState({
        token: null,
        baseUrl: getBaseURL(),
        hasCheckedIn: false,
        survivalStreak: 0,
        missionCompletedCount: 0,
        missionTotalCount: 0,
        lastUpdated: null,
      }).catch((error) => console.error('Widget logout sync failed:', error));
    }
    queryClient.clear();
    setLogout();
    navigate('/');
  }, [navigate, queryClient, setLogout]);

  //최초 진입시 init호출
  const { data: initData, isLoading: isInitLoading } = useQuery({
    queryKey: ['userInit', user?.userId],
    queryFn: async () => {
      const res = await api.get('/api/v1/init');
      return res.data.data; // { hasCheckedInToday, survivalStreak, survivalUpdatedAt, isTutorialCompleted, missionStatuses }
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60 * 5, // 5분간 데이터 캐싱
  });

  const syncWidgetState = useCallback(async (checkedIn = hasCheckedIn) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const missionStatuses = initData?.missionStatuses ?? [];
      const missionTotalCount = isEasyMode ? 2 : 3;
      const missionCompletedCount = [
        missionStatuses[0] || checkedIn,
        !isEasyMode && missionStatuses[1],
        missionStatuses[2],
      ].filter(Boolean).length;

      await WidgetBridge.updateWidgetState({
        token: accessToken,
        baseUrl: getBaseURL(),
        hasCheckedIn: checkedIn,
        survivalStreak: initData?.survivalStreak ?? user?.diaryStreak ?? 0,
        missionCompletedCount,
        missionTotalCount,
        lastUpdated: initData?.survivalUpdatedAt ?? null,
      });
    } catch (error) {
      console.error('Widget sync failed:', error);
    }
  }, [accessToken, hasCheckedIn, initData?.missionStatuses, initData?.survivalStreak, initData?.survivalUpdatedAt, isEasyMode, user?.diaryStreak]);

  /**
   서버 데이터와 전역 상태(Store) 동기화
   */
  useEffect(() => {
    if (initData) {
      setHasCheckedIn(initData.hasCheckedInToday);
      if (initData.survivalUpdatedAt) setLastCheckInTime(initData.survivalUpdatedAt);
      
      setUser((prev: any) => (prev ? { 
        ...prev, 
        diaryStreak: initData.survivalStreak 
      } : null));
    }
  }, [initData, setHasCheckedIn, setLastCheckInTime, setUser]);

  useEffect(() => {
    syncWidgetState();
  }, [syncWidgetState]);

  const completeMission = useCallback(async (index: number) => {
    const isAlreadyCompleted = initData?.missionStatuses?.[index];
    if (isAlreadyCompleted) return;

    try {
      await api.patch(`/api/v1/missions/${index}`);
      queryClient.invalidateQueries({ queryKey: ['userInit'] });
    } catch (error) {
      console.error('Mission complete failed:', error);
    }
  }, [initData?.missionStatuses, queryClient]);

  /**
    출석체크 기능
   */
  const checkInMutation = useMutation({
    mutationFn: () => api.post('/api/survival/checkin'),
    onSuccess: async () => {
      setHasCheckedIn(true);
      await syncWidgetState(true);
      await completeMission(0);
      // 스트릭 갱신을 위해 init 데이터를 새로고침
      queryClient.invalidateQueries({ queryKey: ['userInit'] });
      showToast('인사 완료! 기분 좋은 하루 되세요!', 'success');
    },
    onError: (error: any) => {
      if (error.response?.status === 400) setHasCheckedIn(true);
    }
  });

  // 버튼 잠금 로직: 초기 로딩 중이거나 이미 출석했거나 요청 중일 때
  const isButtonLocked = useMemo(() => {
    if (isInitLoading) return true;
    return hasCheckedIn || checkInMutation.isPending || checkInMutation.isSuccess;
  }, [isInitLoading, hasCheckedIn, checkInMutation.isPending, checkInMutation.isSuccess]);

  const diaryHook = useDiary(showToast);

  useEffect(() => {
    setActiveTab('main');
    setIsMissionOpen(false);
    setTouchCount(0);
    setSearchQuery('');
    setSortOrder('latest');
    setSelectedDate('');
    setToasts([]);
    diaryHook.setIsWriting(false);
    diaryHook.setSelectedDiary(null);
    diaryHook.setIsDeleteConfirm(false);
  }, [user?.userId]);

  const isDiaryDoneToday = useMemo(() => {
    return diaryHook.diaries.some((d: any) => {
      const dDate = new Date(d.date || d.diaryDate || d.createdAt);
      const today = new Date();
      return dDate.toDateString() === today.toDateString();
    });
  }, [diaryHook.diaries]);

  useEffect(() => {
    if (!isEasyMode && isDiaryDoneToday) {
      completeMission(1);
    }
  }, [completeMission, isDiaryDoneToday, isEasyMode]);

  /**
    필터링된 일기 목록 계산
   */
  const filteredDiaries = useMemo(() => {
    let list = Array.isArray(diaryHook.diaries) ? [...diaryHook.diaries] : [];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => 
        (d.title?.toLowerCase().includes(q) ?? false) || 
        (d.content?.toLowerCase().includes(q) ?? false)
      );
    }
    
    if (selectedDate) {
      list = list.filter((d: any) => (d.date || d.diaryDate || d.createdAt || "").includes(selectedDate));
    }

    list.sort((a: any, b: any) => {
      const dateA = new Date(a.date || a.diaryDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.diaryDate || b.createdAt || 0).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [diaryHook.diaries, searchQuery, sortOrder, selectedDate]);

  /**
    미션 시스템 계산
   */
  const missions = useMemo(() => {
    const missionStatuses = initData?.missionStatuses ?? [];
    const baseMissions = [
      { id: 1, title: '안녕이라고 말하기!', current: missionStatuses[0] || isButtonLocked ? 1 : 0, goal: 1, icon: '👋' },
      { id: 3, title: '카나 터치하기', current: missionStatuses[2] ? 3 : touchCount, goal: 3, icon: '🐣' },
    ];
    
    if (!isEasyMode) {
      baseMissions.push({ id: 2, title: '오늘의 일기 쓰기', current: missionStatuses[1] || isDiaryDoneToday ? 1 : 0, goal: 1, icon: '✍️' });
    }
    return baseMissions;
  }, [initData?.missionStatuses, isButtonLocked, isDiaryDoneToday, isEasyMode, touchCount]);

  const completedCount = missions.filter(m => m.current >= m.goal).length;

  const handleKanaTouch = () => {
    if (lottieRef.current) {
      lottieRef.current.stop(); 
      lottieRef.current.play();
    }
    if (touchCount < 3) {
      const newCount = touchCount + 1;
      setTouchCount(newCount);
      if (newCount === 3) {
        completeMission(2);
        showToast('카나가 기분 좋아 보입니다!', 'success');
      }
    }
  };

  return (
    <div className="flex justify-center h-screen bg-[#F0F2F5] font-sans text-[#4B4B4B] overflow-hidden select-none">
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col relative h-full">
        
        {/* 상단 헤더 */}
        <header className={`${isEasyMode ? 'h-16' : 'h-14'} border-b border-gray-100 flex items-center justify-between px-5 bg-white shrink-0 z-10`}>
          <img src={LogoImg} alt="LIFELINE" className={`${isEasyMode ? 'h-9' : 'h-8'} w-auto object-contain`} />
          <div className={`flex gap-2 items-center ${!isEasyMode ? 'cursor-pointer' : ''}`} onClick={() => !isEasyMode && setIsMissionOpen(true)}>
            <span className={`${isEasyMode ? 'text-xl' : 'text-sm'} text-orange-400 font-black`}> 
              {user?.diaryStreak || 0}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-4 flex flex-col">
          {activeTab === 'main' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-full items-center justify-center">
              
              {/* 말풍선 가이드 */}
              <div className="w-full mt-2 shrink-0">
                <div className={`${isEasyMode ? 'bg-[#1CB0F6] p-5 rounded-[32px]' : 'bg-[#1CB0F6] p-6 rounded-[28px]'} text-white shadow-lg w-full text-center relative after:content-[''] after:absolute after:top-[98%] after:left-1/2 after:-translate-x-1/2 after:border-l-[12px] after:border-l-transparent after:border-r-[12px] after:border-r-transparent after:border-t-[12px] after:border-t-current`}>
                  <h2 className={`${isEasyMode ? 'text-[22px] font-black' : 'text-xl font-black'} leading-tight break-keep`}>
                    {user?.name}님, <br />
                    {isButtonLocked && !isInitLoading ? "오늘 인사를 마쳤어요!" : "카나에게 인사할까요?"}
                  </h2>
                </div>
              </div>

              {/* 카나 마스코트 애니메이션 */}
              <div className="flex-1 flex items-center justify-center mt-8 mb-4 min-h-[220px] cursor-pointer" onClick={handleKanaTouch}>
                {Lottie && kanaLottie ? (
                  <Lottie 
                    lottieRef={lottieRef} animationData={kanaLottie} loop={false} autoplay={false}
                    style={{ width: isEasyMode ? '360px' : '320px', height: isEasyMode ? '360px' : '320px' }}
                    className="drop-shadow-2xl transition-all duration-500" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl animate-bounce">🐣</span>
                    <p className="text-xs text-gray-400">카나 로딩 중...</p>
                  </div>
                )}
              </div>

              {/* 출석체크 메인 버튼 */}
              <div className="w-full mt-auto">
                <button 
                  onClick={() => checkInMutation.mutate()} 
                  disabled={isButtonLocked} 
                  className={`w-full font-black transition-all mb-4 ${isEasyMode ? `py-7 text-3xl rounded-[32px] shadow-[0_9px_0_0_#46A302] active:translate-y-2 active:shadow-none` : `py-5 text-xl rounded-[22px] shadow-[0_6px_0_0_#46A302] active:translate-y-1 active:shadow-none`} ${isButtonLocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#58CC02] text-white'}`}
                >
                  {isInitLoading ? '정보 확인 중...' : (isButtonLocked ? '반가웠어요!' : '안녕, 카나!')}
                </button>

                {/* 미션 간략 표시 (이지 모드 제외) */}
                {!isEasyMode && (
                  <div onClick={() => setIsMissionOpen(true)} className="w-full bg-white border-2 border-gray-100 rounded-[22px] p-4 mb-4 cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-gray-400 text-[10px] uppercase">Daily Missions</span>
                      <span className="font-black text-[#1CB0F6] text-xs">{completedCount}/{missions.length}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div style={{ width: `${(completedCount / missions.length) * 100}%` }} className="h-full bg-[#1CB0F6] transition-all duration-500" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 일기 목록 탭 */}
          {activeTab === 'diary' && !isEasyMode && (
            <div className="h-full flex flex-col pt-2 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-gray-800">내 기록</h2>
                <button onClick={() => diaryHook.setIsWriting(true)} className="bg-[#58CC02] text-white px-5 py-2.5 rounded-2xl font-black shadow-[0_4px_0_0_#46A302] active:translate-y-1 transition-all text-sm">+ 새 일기</button>
              </div>

              <div className="flex flex-col gap-2 mb-4 shrink-0">
                <input 
                  type="text" placeholder="기록 검색..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 bg-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]"
                />
                <div className="flex gap-2">
                  <input 
                    type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500"
                  />
                  <select 
                    value={sortOrder} onChange={(e: any) => setSortOrder(e.target.value)}
                    className="p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500"
                  >
                    <option value="latest">최신순</option>
                    <option value="oldest">오래된순</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pb-4">
                {filteredDiaries.length > 0 ? filteredDiaries.map((diary: any, index: number) => (
                  <motion.div key={diary.id || `temp-${index}`} layout onClick={() => diaryHook.handleReadDiary(diary.id)} className="bg-white border-2 border-gray-50 rounded-2xl p-4 mb-3 shadow-sm cursor-pointer hover:border-[#1CB0F6]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{diary.mood || '😊'}</span>
                        <div>
                          <p className="font-black text-gray-700 truncate w-40">{diary.title || '제목 없음'}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">{diary.date || diary.diaryDate || '날짜 없음'}</p>
                        </div>
                      </div>
                      <span className="text-gray-300">❯</span>
                    </div>
                  </motion.div>
                )) : <div className="text-center py-20 text-gray-300 font-bold">기록이 아직 없어요</div>}
              </div>
            </div>
          )}

          {/* 프로필 탭 */}
          {activeTab === 'profile' && (
            <div className="flex flex-col items-center pt-8">
              <div className={`${isEasyMode ? 'w-32 h-32 text-5xl' : 'w-28 h-28 text-4xl'} bg-[#1CB0F6] rounded-full flex items-center justify-center text-white font-black mb-4 border-4 border-white shadow-xl`}>
                {user?.name?.[0]}
              </div>
              <h3 className={`${isEasyMode ? 'text-3xl' : 'text-2xl'} font-black mb-6`}>{user?.name}</h3>
              <div className="grid grid-cols-3 gap-4 w-full border-y-2 border-gray-50 py-8 text-center">
                <div className="flex flex-col"><span className="font-black text-orange-400 text-xl">{user?.diaryStreak || 0}</span><span className="text-[10px] font-black text-gray-400">STREAK</span></div>
                <div className="flex flex-col border-x-2 border-gray-50"><span className="font-black text-blue-400 text-xl">500</span><span className="text-[10px] font-black text-gray-400">MESO</span></div>
                <div className="flex flex-col"><span className="font-black text-green-500 text-xl">{diaryHook.diaries.length}</span><span className="text-[10px] font-black text-gray-400">DIARIES</span></div>
              </div>
            </div>
          )}

          {/* 설정 탭 */}
          {activeTab === 'settings' && (
            <div className="pt-2 pb-6">
              <h2 className="text-2xl font-black mb-5 text-gray-800">설정</h2>

              <div className="bg-[#F7F9FA] border-2 border-gray-100 rounded-[28px] p-5 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#1CB0F6] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                    {user?.name?.[0] || user?.userId?.[0] || 'L'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-black text-gray-800 truncate">{user?.name || user?.userId}</p>
                    <p className="text-xs font-black text-gray-400 truncate">{user?.userId}</p>
                  </div>
                </div>
              </div>

              <section className="bg-white border-2 border-gray-50 rounded-[24px] px-5 mb-4">
                <SettingRow label="사용 모드" value={user?.mode === 'EASY' ? '이지 모드' : '노멀 모드'} />
                <SettingRow label="생년월일" value={user?.birthDate} />
                <SettingRow label="비상 연락처" value={user?.emergencyContact} />
              </section>

              <section className="bg-white border-2 border-gray-50 rounded-[24px] px-5 mb-6">
                <SettingRow label="오늘 체크인" value={hasCheckedIn ? '완료' : '아직 안 함'} />
                <SettingRow label="연속 안부" value={`${user?.diaryStreak || 0}일`} />
                <SettingRow label="마지막 갱신" value={initData?.survivalUpdatedAt ? new Date(initData.survivalUpdatedAt).toLocaleString() : null} />
              </section>

              <button onClick={handleLogout} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black">
                로그아웃
              </button>
            </div>
          )}
        </main>

        {/* 하단 내비게이션 바 */}
        <footer className={`${isEasyMode ? 'h-20 pb-3' : 'h-20 pb-6'} bg-white border-t border-gray-100 flex items-center justify-around px-4 shrink-0 z-50`}>
          <TabButton icon="🏠" label="홈" active={activeTab === 'main'} onClick={() => setActiveTab('main')} isEasy={isEasyMode} />
          {!isEasyMode && <TabButton icon="📖" label="기록" active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} isEasy={isEasyMode} />}
          <TabButton icon="👤" label="프로필" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} isEasy={isEasyMode} />
          <TabButton icon="⚙️" label="설정" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isEasy={isEasyMode} />
        </footer>

        {/* 미션 상세 모달 */}
        <AnimatePresence>
          {isMissionOpen && !isEasyMode && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMissionOpen(false)} className="absolute inset-0 bg-black/40 z-[60] backdrop-blur-[2px]" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] p-8 shadow-2xl">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-gray-800">오늘의 미션 <span className="text-[#1CB0F6]">{completedCount}/{missions.length}</span></h3>
                <div className="flex flex-col gap-4">
                  {missions.map((mission) => (
                    <div key={mission.id} className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${mission.current >= mission.goal ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-50'}`}>
                      <span className="text-3xl">{mission.icon}</span>
                      <div className="flex-1">
                        <p className={`font-black text-sm ${mission.current >= mission.goal ? 'text-[#1CB0F6]' : 'text-gray-500'}`}>{mission.title}</p>
                        <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <div style={{ width: `${(mission.current / mission.goal) * 100}%` }} className={`h-full transition-all duration-700 ${mission.current >= mission.goal ? 'bg-[#1CB0F6]' : 'bg-gray-300'}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 일기 관련 모달 */}
      <DiaryWriteModal isOpen={diaryHook.isWriting} onClose={() => diaryHook.setIsWriting(false)} onSave={diaryHook.handleSaveDiary} newDiary={diaryHook.newDiary} setNewDiary={diaryHook.setNewDiary} />
      <DiaryDetailModal diary={diaryHook.selectedDiary} onClose={() => diaryHook.setSelectedDiary(null)} onDelete={diaryHook.handleDeleteDiary} onUpdate={diaryHook.handleUpdateDiary} isDeleteConfirm={diaryHook.isDeleteConfirm} setIsDeleteConfirm={diaryHook.setIsDeleteConfirm} />

      {/* 함수 알림 컨테이너 */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[320px] px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-5 rounded-[24px] shadow-2xl border-2 font-black text-center pointer-events-auto bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6] ${isEasyMode ? 'text-2xl py-8' : 'text-base'}`}>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardPage;
