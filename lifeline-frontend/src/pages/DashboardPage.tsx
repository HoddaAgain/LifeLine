import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import api from '../api/axios';

// 기존 컴포넌트 및 훅 임포트
import DiaryWriteModal from '../components/DiaryWrite';
import DiaryDetailModal from '../components/DiaryDetail';
import { useDiary } from '../hooks/useDiary';

// 캐릭터 이미지
import chickImage from '../assets/kana1.png';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// 미션 타입 정의 임시 api없어서 예측해본것
interface Mission {
  id: number;
  title: string;
  current: number;
  goal: number;
  icon: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setLogout } = useUserStore();
  const isEasyMode = user?.mode === 'EASY';

  // UI 상태 관리
  const [activeTab, setActiveTab] = useState<'main' | 'diary' | 'settings' | 'profile'>('main');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { hasCheckedIn, setHasCheckedIn } = useUserStore();
  const [isMissionOpen, setIsMissionOpen] = useState(false); // 미션 창 상태 임시

  // 미션 데이터 어캐받아오지 뭘주고 뭘받아올까
  const [missions] = useState<Mission[]>([
    { id: 1, title: '1000보 걷기!', current: hasCheckedIn ? 1 : 0, goal: 1, icon: '' },
    { id: 2, title: '오늘의 일기 쓰기', current: 0, goal: 1, icon: '' },
    { id: 3, title: '카나 터치하기', current: 0, goal: 3, icon: '' },
  ]);

  const completedCount = missions.filter(m => m.current >= m.goal).length;

  // 커스텀 알림
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // 일기 로직 훅
  const diaryHook = useDiary(showToast);

  // 생존 신고 로직
  const handleCheckIn = async () => {
    try {
      const res = await api.post('/api/survival/checkin');
      if (res.data.status === "SUCCESS") {
        setHasCheckedIn(true);
        showToast('오늘 하루도 활기차게! ✨', 'success');
      }
    } catch (error) {
      showToast('출석에 실패했습니다.', 'error');
    }
  };
  
  return (
    <div className="flex justify-center min-h-screen bg-[#F0F2F5] font-sans text-[#4B4B4B]">
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col relative overflow-hidden min-h-screen">
        
        {/* 상단 헤더 */}
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-5 bg-white shrink-0">
          <div className="text-[#1CB0F6] font-black text-xl tracking-tighter">LIFELINE</div>
          <div 
            className="flex gap-2 items-center cursor-pointer active:scale-95 transition-transform"
            onClick={() => setIsMissionOpen(true)}
          >
            <span className="text-orange-400 font-black text-sm">🔥 {user?.diaryStreak || 0}</span>
            <div className="w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-black border-2 border-white">
              {missions.length - completedCount}
            </div>
          </div>
        </header>

        {/* 메인 구역 */}
        <main className="flex-1 overflow-y-auto px-6 pb-24 pt-4 flex flex-col">
          
          {/* 메인 탭 */}
          {activeTab === 'main' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full items-center py-2 flex-1">
              
              {/* 말풍선 */}
              <div className="w-full flex justify-center relative mt-2">
                <div className="bg-[#1CB0F6] text-white p-6 px-8 rounded-[28px] shadow-lg w-full text-center relative
                  after:content-[''] after:absolute after:top-[98%] after:left-1/2 after:-translate-x-1/2 
                  after:border-l-[12px] after:border-l-transparent after:border-r-[12px] after:border-r-transparent 
                  after:border-t-[12px] after:border-t-[#1CB0F6]">
                  <h2 className="text-xl font-black leading-tight break-keep">
                    {user?.name || "사용자"}님,<br/>
                    {completedCount === missions.length ? "오늘 미션 완료! 최고예요!" : (isEasyMode ? "반가워요! 오늘도 힘내봐요!" : "오늘 하루는 어땠나요?")}
                  </h2>
                </div>
              </div>

              {/* 캐릭터 */}
              <div className="flex-1 flex items-center justify-center my-4">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
                  <img src={chickImage} alt="LIFEY" className="w-48 h-48 lg:w-56 lg:h-56 object-contain drop-shadow-2xl" />
                </motion.div>
              </div>

              {/* 미션 요약 카드 */}
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsMissionOpen(true)}
                className="w-full bg-white border-2 border-gray-100 rounded-[22px] p-4 mb-4 cursor-pointer shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Daily Missions</span>
                  <span className="font-black text-[#1CB0F6] text-xs">{completedCount}/{missions.length}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / missions.length) * 100}%` }}
                    className="h-full bg-[#1CB0F6]"
                  />
                </div>
              </motion.div>

              {/* 출석 버튼 */}
              <div className="w-full flex flex-col items-center gap-2 mb-4">
                <button 
                  onClick={handleCheckIn} 
                  disabled={hasCheckedIn} 
                  className={`w-full py-5 rounded-[22px] font-black text-xl transition-all shadow-[0_6px_0_0_#46A302] active:shadow-none active:translate-y-1
                    ${hasCheckedIn ? 'bg-gray-200 text-gray-400 shadow-none translate-y-1' : 'bg-[#58CC02] text-white hover:brightness-105'}`}
                >
                  {hasCheckedIn ? '출석 완료!' : '안녕하세요!'}
                </button>
              </div>
            </motion.div>
          )}

          {/* 일기 탭 */}
          {activeTab === 'diary' && !isEasyMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black">내 기록 📖</h2>
                <button onClick={() => diaryHook.setIsWriting(true)} className="bg-[#58CC02] text-white px-4 py-2 rounded-xl text-xs font-black shadow-[0_3px_0_0_#46A302] active:translate-y-0.5 active:shadow-none transition-all">+ 추가</button>
              </div>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="제목으로 찾기..." 
                  value={diaryHook.searchTerm} 
                  onChange={(e) => diaryHook.setSearchTerm(e.target.value)} 
                  className="flex-1 pl-4 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-[#1CB0F6]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                {diaryHook.currentItems.length > 0 ? (
                  diaryHook.currentItems.map(diary => (
                    <div key={diary.id} onClick={() => diaryHook.handleReadDiary(diary.id)} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-all cursor-pointer">
                      <div className="text-2xl bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center">{diary.mood}</div>
                      <div className="flex-1 font-black text-gray-700">{diary.title}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-gray-300 font-bold">일기가 없습니다.</div>
                )}
              </div>
              {diaryHook.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4 pb-2">
                  {Array.from({ length: diaryHook.totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => diaryHook.setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl font-black text-sm transition-all ${
                        diaryHook.currentPage === i + 1 ? 'bg-[#1CB0F6] text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* 프로필 탭 */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pt-8">
              <div className="w-28 h-28 bg-[#1CB0F6] rounded-full flex items-center justify-center text-white text-4xl font-black mb-4 shadow-inner">
                {user?.name?.[0] || 'U'}
              </div>
              <h3 className="text-2xl font-black mb-1">{user?.name}</h3>
              <p className="text-gray-400 text-sm font-bold mb-8">{user?.userId}</p>
              <div className="grid grid-cols-3 gap-4 w-full border-t border-gray-100 pt-8">
                <div className="text-center"><div className="text-xl font-black text-[#1CB0F6]">{user?.diaryStreak || 0}</div><div className="text-[10px] font-black text-gray-400 uppercase">Streak</div></div>
                <div className="text-center"><div className="text-xl font-black text-[#FF9600]">500</div><div className="text-[10px] font-black text-gray-400 uppercase">Meso</div></div>
                <div className="text-center"><div className="text-xl font-black text-[#58CC02]">{diaryHook.diaries.length}</div><div className="text-[10px] font-black text-gray-400 uppercase">Diaries</div></div>
              </div>
            </motion.div>
          )}

          {/* 설정 탭 */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-black mb-6">설정 ⚙️</h2>
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-black text-gray-600">모드 설정</span>
                  <span className="bg-[#1CB0F6] text-white px-4 py-1.5 rounded-full text-xs font-black">{user?.mode}</span>
                </div>
                <button onClick={() => { setLogout(); navigate('/'); }} className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-sm font-black text-gray-400">로그아웃</button>
              </div>
            </motion.div>
          )}
        </main>

        {/* 미션 시트 */}
        <AnimatePresence>
          {isMissionOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMissionOpen(false)}
                className="fixed inset-0 bg-black/40 z-[110] max-w-md mx-auto"
              />
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-white z-[120] rounded-t-[40px] px-6 pt-8 pb-10 max-w-md mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
              >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                <h3 className="text-2xl font-black mb-6 flex items-center gap-2">오늘의 미션 <span className="text-[#1CB0F6]">Quest</span></h3>
                <div className="flex flex-col gap-4">
                  {missions.map(mission => (
                    <div key={mission.id} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50">
                      <div className="text-3xl">{mission.icon}</div>
                      <div className="flex-1">
                        <div className="font-black text-gray-700">{mission.title}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">
                          {mission.current} / {mission.goal} 완료
                        </div>
                      </div>
                      {mission.current >= mission.goal && <div className="text-[#58CC02] text-2xl">✅</div>}
                    </div>
                  ))}
                </div>
                <button onClick={() => setIsMissionOpen(false)} className="w-full mt-8 py-4 bg-[#1CB0F6] text-white rounded-2xl font-black shadow-[0_5px_0_0_#1899D6] active:shadow-none active:translate-y-1">확인</button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 하단 네비 */}
        <footer className="h-20 bg-white border-t border-gray-100 flex items-center justify-around px-4 pb-4 shrink-0 z-50">
          <TabButton icon="🏠" label="홈" active={activeTab === 'main'} onClick={() => setActiveTab('main')} />
          {!isEasyMode && <TabButton icon="📖" label="기록" active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} />}
          <TabButton icon="👤" label="프로필" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <TabButton icon="⚙️" label="설정" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </footer>

        {/* 토스트 알림 */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[320px] px-4 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-4 rounded-2xl shadow-xl border-2 font-black text-center pointer-events-auto transition-all ${
                  toast.type === 'success' ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]' :
                  toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {toast.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 모달 */}
      <DiaryWriteModal isOpen={diaryHook.isWriting} onClose={() => diaryHook.setIsWriting(false)} onSave={diaryHook.handleSaveDiary} newDiary={diaryHook.newDiary} setNewDiary={diaryHook.setNewDiary} />
      <DiaryDetailModal diary={diaryHook.selectedDiary} onClose={() => diaryHook.setSelectedDiary(null)} onDelete={diaryHook.handleDeleteDiary} isDeleteConfirm={diaryHook.isDeleteConfirm} setIsDeleteConfirm={diaryHook.setIsDeleteConfirm} />
    </div>
  );
};

const TabButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className="flex-1 flex flex-col items-center pt-2 active:scale-90 transition-transform">
    <span className={`text-2xl mb-1 ${active ? 'scale-110' : 'grayscale opacity-30'}`}>{icon}</span>
    <span className={`text-[10px] font-black ${active ? 'text-[#1CB0F6]' : 'text-gray-400'}`}>{label}</span>
  </button>
);

export default DashboardPage;