import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../store/useUserStore';
import api from '../api/axios';

import DiaryWriteModal from '../components/DiaryWrite';
import DiaryDetailModal from '../components/DiaryDetail';
import { useDiary } from '../hooks/useDiary';

import chickImage from '../assets/kana1.png';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    user, setUser, setLogout, 
    hasCheckedIn, setHasCheckedIn, 
    lastCheckInTime, setLastCheckInTime 
  } = useUserStore();
  
  const isEasyMode = user?.mode === 'EASY';

  // UI 상태
  const [activeTab, setActiveTab] = useState<'main' | 'diary' | 'settings' | 'profile'>('main');
  const [isMissionOpen, setIsMissionOpen] = useState(false);

  // 일기 검색/정렬 필터
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [selectedDate, setSelectedDate] = useState('');

  // 커스텀 알림
  const [toasts, setToasts] = useState<any[]>([]);
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const checkIsToday = useCallback((isoString: string | null | undefined) => {
    if (!isoString) return false;
    try {
      const date = new Date(isoString);
      const today = new Date();
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    } catch (e) { return false; }
  }, []);

  /* 출석 상태 데이터 가져오기 로그 아직 날짜 가져오는거 없어서 안됨 장식임*/
  const { data: attendanceData, isLoading: isStatusLoading } = useQuery({
    queryKey: ['attendance', user?.userId],
    queryFn: async () => {
      console.log("[Data Fetch] 서버에 출석 데이터를 요청합니다...");
      const res = await api.get('/api/survival/survival-streak');
      console.log("[Data Fetch] 서버 응답 완료:", res.data.data);
      return res.data.data;
    },
    enabled: !!user?.userId,
  });

  // 서버 데이터 수신 시 동기화 로그
  useEffect(() => {
    if (attendanceData) {
      const isToday = checkIsToday(attendanceData.lastManualCheckIn);
      console.log(`[Sync] 오늘 출석 여부 판별: ${isToday ? '완료' : '미완료'}`);
      setHasCheckedIn(isToday);
      if (attendanceData.lastManualCheckIn) setLastCheckInTime(attendanceData.lastManualCheckIn);
      setUser((prev: any) => (prev ? { ...prev, diaryStreak: attendanceData.survivalStreak } : null));
    }
  }, [attendanceData, checkIsToday, setHasCheckedIn, setLastCheckInTime, setUser]);

  /* 출석 체크 실행 */
  const checkInMutation = useMutation({
    mutationFn: () => api.post('/api/survival/checkin'),
    onSuccess: (res) => {
      console.log("[Mutation] 출석 체크 성공");
      setHasCheckedIn(true);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      showToast('오늘 하루도 화이팅! ✨', 'success');
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        console.warn("[Mutation] 이미 출석된 상태입니다.");
        setHasCheckedIn(true);
      }
    }
  });

  const diaryHook = useDiary(showToast);

  
  const isButtonLocked = useMemo(() => {
    if (isStatusLoading) return true; 
    if (attendanceData) return checkIsToday(attendanceData.lastManualCheckIn);
    return hasCheckedIn;
  }, [isStatusLoading, attendanceData, hasCheckedIn, checkIsToday]);

  // 일기 필터링 로직 
  const filteredDiaries = useMemo(() => {
    let list = Array.isArray(diaryHook.diaries) ? [...diaryHook.diaries] : [];
    
    // 검색어 필터
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => 
        (d.title?.toLowerCase().includes(q) ?? false) || 
        (d.content?.toLowerCase().includes(q) ?? false)
      );
    }
    
    // 날짜 필터
    if (selectedDate) {
      list = list.filter((d: any) => {
        const dDate = d.date || d.diaryDate || d.createdAt || "";
        return dDate.includes(selectedDate);
      });
    }

    // 정렬
    list.sort((a: any, b: any) => {
      const dateA = new Date(a.date || a.diaryDate || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.diaryDate || b.createdAt || 0).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [diaryHook.diaries, searchQuery, sortOrder, selectedDate]);

  const missions = useMemo(() => [
    { id: 1, title: '안녕이라고 말하기!', current: isButtonLocked ? 1 : 0, goal: 1, icon: '👋' },
    { id: 2, title: '오늘의 일기 쓰기', current: diaryHook.diaries.some((d: any) => checkIsToday(d.date || d.diaryDate || d.createdAt)) ? 1 : 0, goal: 1, icon: '✍️' },
    { id: 3, title: '카나 터치하기', current: 0, goal: 3, icon: '🐣' },
  ], [isButtonLocked, diaryHook.diaries, checkIsToday]);

  const completedCount = missions.filter(m => m.current >= m.goal).length;

  return (
    <div className="flex justify-center h-screen bg-[#F0F2F5] font-sans text-[#4B4B4B] overflow-hidden">
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col relative h-full">
        {/* 헤더 */}
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-5 bg-white shrink-0 z-10">
          <div className="text-[#1CB0F6] font-black text-xl tracking-tighter italic">LIFELINE</div>
          <div className={`flex gap-2 items-center ${!isEasyMode ? 'cursor-pointer' : ''}`} onClick={() => !isEasyMode && setIsMissionOpen(true)}>
            <span className="text-orange-400 font-black text-sm">🔥 {user?.diaryStreak || 0}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-4 pb-4 flex flex-col">
          {activeTab === 'main' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-full items-center py-2">
              <div className="w-full mt-2 shrink-0">
                <div className="bg-[#1CB0F6] text-white p-6 px-8 rounded-[28px] shadow-lg w-full text-center relative after:content-[''] after:absolute after:top-[98%] after:left-1/2 after:-translate-x-1/2 after:border-l-[12px] after:border-l-transparent after:border-r-[12px] after:border-r-transparent after:border-t-[12px] after:border-t-[#1CB0F6]">
                  <h2 className="text-xl font-black leading-tight break-keep">
                    {user?.name}님, {isButtonLocked && !isStatusLoading ? "오늘 인사를 마쳤어요!" : "반가워요!"}
                  </h2>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center my-4 min-h-[180px]">
                <img src={chickImage} alt="LIFEY" className="w-40 h-40 object-contain drop-shadow-2xl" />
              </div>
              <div className="w-full mt-auto">
                <button 
                  onClick={() => checkInMutation.mutate()} 
                  disabled={isButtonLocked || checkInMutation.isPending} 
                  className={`w-full py-5 rounded-[22px] font-black text-xl transition-all mb-2 ${
                    (isButtonLocked || checkInMutation.isPending)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-[#58CC02] text-white shadow-[0_6px_0_0_#46A302] active:shadow-none active:translate-y-1'
                  }`}
                >
                  {isStatusLoading ? '상태 확인 중...' : (checkInMutation.isPending ? '기록 중...' : '안녕하세요!')}
                </button>
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

          {activeTab === 'diary' && !isEasyMode && (
            <div className="h-full flex flex-col pt-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black italic">내 기록 📖</h2>
                <button onClick={() => diaryHook.setIsWriting(true)} className="bg-[#58CC02] text-white px-5 py-2.5 rounded-2xl font-black shadow-[0_4px_0_0_#46A302] active:translate-y-1 transition-all text-sm">+ 새 일기</button>
              </div>

              {/* 검색 및 필터 UI 복구 */}
              <div className="flex flex-col gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="제목이나 내용 검색..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 outline-none text-sm font-bold" 
                />
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-100 text-xs font-bold outline-none" 
                  />
                  <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value as any)} 
                    className="px-4 py-2 rounded-xl border-2 border-gray-100 text-xs font-bold outline-none bg-white"
                  >
                    <option value="latest">최신순</option>
                    <option value="oldest">오래된순</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {filteredDiaries.length > 0 ? filteredDiaries.map((diary: any, index: number) => (
                  <motion.div key={diary.id || `temp-${index}`} layout onClick={() => diaryHook.handleReadDiary(diary.id)} className="bg-white border-2 border-gray-50 rounded-2xl p-4 mb-3 shadow-sm cursor-pointer hover:border-[#1CB0F6]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{diary.mood || '😊'}</span>
                        <div>
                          <p className="font-black text-gray-700 leading-tight truncate w-40">{diary.title || '제목 없음'}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">{diary.date || diary.diaryDate || '날짜 없음'}</p>
                        </div>
                      </div>
                      <span className="text-gray-300 text-xs font-black">❯</span>
                    </div>
                  </motion.div>
                )) : <div className="text-center py-20 text-gray-300 font-bold">찾으시는 기록이 없어요</div>}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="flex flex-col items-center pt-8">
              <div className="w-28 h-28 bg-[#1CB0F6] rounded-full flex items-center justify-center text-white text-4xl font-black mb-4 border-4 border-white shadow-xl">{user?.name?.[0]}</div>
              <h3 className="text-2xl font-black mb-1">{user?.name}</h3>
             
              <div className="grid grid-cols-3 gap-4 w-full border-y-2 border-gray-50 py-8 text-center">
                <div className="flex flex-col"><span className="text-xl font-black text-orange-400">{user?.diaryStreak || 0}</span><span className="text-[10px] font-black text-gray-400 uppercase">Streak</span></div>
                <div className="flex flex-col border-x-2 border-gray-50"><span className="text-xl font-black text-blue-400">500</span><span className="text-[10px] font-black text-gray-400 uppercase">Meso</span></div>
                <div className="flex flex-col"><span className="text-xl font-black text-green-500">{diaryHook.diaries.length}</span><span className="text-[10px] font-black text-gray-400 uppercase">Diaries</span></div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="pt-2">
              <h2 className="text-2xl font-black mb-6 italic">Settings ⚙️</h2>
              <button onClick={() => { setLogout(); navigate('/'); }} className="w-full py-4 bg-red-50 border-2 border-red-100 rounded-2xl text-sm font-black text-red-500">로그아웃</button>
            </div>
          )}
        </main>

        <footer className="h-20 bg-white border-t border-gray-100 flex items-center justify-around px-4 pb-6 shrink-0 z-50">
          <TabButton icon="🏠" label="홈" active={activeTab === 'main'} onClick={() => setActiveTab('main')} />
          {!isEasyMode && <TabButton icon="📖" label="기록" active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} />}
          <TabButton icon="👤" label="프로필" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <TabButton icon="⚙️" label="설정" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </footer>

        {/* 미션 모달 */}
        <AnimatePresence>
          {isMissionOpen && !isEasyMode && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMissionOpen(false)} className="absolute inset-0 bg-black/40 z-[60] backdrop-blur-[2px]" />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] p-8">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                <h3 className="text-2xl font-black mb-6 flex items-center gap-2">오늘의 미션 <span className="text-[#1CB0F6]">{completedCount}/{missions.length}</span></h3>
                <div className="flex flex-col gap-4 mb-4">
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

      <DiaryWriteModal isOpen={diaryHook.isWriting} onClose={() => diaryHook.setIsWriting(false)} onSave={diaryHook.handleSaveDiary} newDiary={diaryHook.newDiary} setNewDiary={diaryHook.setNewDiary} />
      <DiaryDetailModal diary={diaryHook.selectedDiary} onClose={() => diaryHook.setSelectedDiary(null)} onDelete={diaryHook.handleDeleteDiary} isDeleteConfirm={diaryHook.isDeleteConfirm} setIsDeleteConfirm={diaryHook.setIsDeleteConfirm} />

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[320px] px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl shadow-xl border-2 font-black text-center pointer-events-auto bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]">
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className="flex-1 flex flex-col items-center pt-2 group">
    <span className={`text-2xl mb-1 ${active ? 'scale-110' : 'grayscale opacity-30'}`}>{icon}</span>
    <span className={`text-[10px] font-black ${active ? 'text-[#1CB0F6]' : 'text-gray-400'}`}>{label}</span>
  </button>
);

export default DashboardPage;