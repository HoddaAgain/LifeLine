import React, { useState , useCallback} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import api from '../api/axios'; 


import DiaryWriteModal from '../components/DiaryWrite';
import DiaryDetailModal from '../components/DiaryDetail';
import { useDiary } from '../hooks/useDiary';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setLogout, setUser, isLoggedIn } = useUserStore(); 
  const isEasyMode = user?.mode === 'EASY';

  // UI 관련 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'diary' | 'settings' | 'profile'>('main');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  // 토스트 메시지 함수
 // showToast를 useCallback으로 감싸서 useDiary에 전달
const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const id = Date.now();
  setToasts((prev) => [...prev, { id, message, type }]);
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, 3000);
}, []); // 의존성 배열을 비워서 한 번만 생성되게 함

  
  const {
    isLoading, isWriting, setIsWriting,
    selectedDiary, setSelectedDiary,
    newDiary, setNewDiary,
    isDeleteConfirm, setIsDeleteConfirm,
    searchTerm, setSearchTerm,
    sortOrder, setSortOrder,
    currentPage, setCurrentPage,
    totalPages, currentItems,
    handleSaveDiary, handleReadDiary, handleDeleteDiary
  } = useDiary(showToast);

  // 생존 신고
  const handleCheckIn = async () => {
    try {
      const res = await api.post('/api/survival/checkin');
      if (res.data.status === "SUCCESS") {
        setHasCheckedIn(true);
        showToast('출석 완료! 오늘 하루도 안전하게. ✨', 'success');
      }
    } catch (error) { showToast('출석 체크에 실패했습니다.', 'error'); }
  };

  // 모드 변경 로직
  const handleChangeMode = async (newMode: 'EASY' | 'NORMAL') => {
    try {
      const res = await api.patch('/api/survival/auto-check', { isAutoCheckEnabled: newMode === 'EASY' });
      if (res.data.status === "SUCCESS") {
        if (setUser && user) setUser({ ...user, mode: newMode });
        showToast(`${newMode === 'EASY' ? '이지' : '노멀'} 모드로 변경되었습니다!`, 'success');
        setActiveTab('main');
      }
    } catch (error) { showToast('모드 변경에 실패했습니다.', 'error'); }
  };

  const handleLogoutAction = () => { setLogout(); navigate('/'); };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-[#1CB0F6] bg-white">
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>LOADING...</motion.div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F7F7F7] font-sans overflow-x-hidden text-[#4B4B4B]">
      {/* 토스트 알림 */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-[350px] px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-2xl shadow-xl border-2 font-black text-center pointer-events-auto ${toast.type === 'success' ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]' : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-600'}`}>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 모바일 헤더 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-gray-100 z-40 flex items-center px-4 lg:hidden">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-2xl">☰</button>
        <div className="ml-4 text-[#1CB0F6] font-black text-xl tracking-tighter">LIFELINE</div>
      </header>

      {/* 사이드바 */}
      <AnimatePresence>
        {isSidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-[55] lg:hidden" />}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 h-full bg-white border-r-2 border-gray-200 flex flex-col p-4 z-[60] transition-transform duration-300 ease-in-out w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="text-[#1CB0F6] font-black text-3xl px-4 mb-10 mt-2 cursor-pointer" onClick={() => setActiveTab('main')}>LIFELINE</div>
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem icon="🏠" label="메인" active={activeTab === 'main'} onClick={() => { setActiveTab('main'); setIsSidebarOpen(false); }} />
          <SidebarItem icon="📖" label="일기장" active={activeTab === 'diary'} disabled={isEasyMode} onClick={() => { if(isEasyMode) return showToast('이지 모드에서는 생존신고만 가능합니다.', 'info'); setActiveTab('diary'); setIsSidebarOpen(false); }} />
          <SidebarItem icon="👤" label="프로필" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} />
          <SidebarItem icon="⚙️" label="설정" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
        </nav>
        <div className="p-4 border-t-2 border-gray-100 flex flex-col gap-3">
          <button onClick={handleLogoutAction} className="text-xs font-black text-gray-400 hover:text-red-500 transition-colors uppercase text-left">Logout</button>
        </div>
      </aside>

      {/* 메인  영역 */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-10 lg:pt-10 px-4 lg:ml-64 lg:mr-80 min-w-0">
        {activeTab === 'main' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[600px] flex flex-col items-center">
            <div className="w-full bg-[#1CB0F6] rounded-[24px] p-8 lg:p-12 text-white mb-12 shadow-lg relative overflow-hidden">
              <h2 className="text-3xl font-black z-10 leading-tight">{user?.name || user?.userId || "사용자"}님,<br/>{isEasyMode ? "반가워요! 안전하신가요?" : "오늘 하루는 어땠나요?"}</h2>
            </div>
            <div className="flex flex-col items-center gap-8 py-10 w-full">
              <div className="text-9xl animate-bounce mb-4">{isEasyMode ? '🌱' : '🐣'}</div>
              <button onClick={handleCheckIn} disabled={hasCheckedIn} className={`w-full max-w-sm py-6 rounded-3xl font-black text-2xl transition-all shadow-[0_8px_0_0_#46A302] active:shadow-none active:translate-y-2 ${hasCheckedIn ? 'bg-gray-200 text-gray-400 shadow-none translate-y-2' : 'bg-[#58CC02] text-white hover:brightness-105'}`}>{hasCheckedIn ? '출석 완료!' : '안녕하세요!'}</button>
              <p className="text-gray-400 font-bold">기록을 남겨주세요</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'diary' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-[600px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-black text-[#4B4B4B]">내 일기장 📖</h2>
              <button onClick={() => setIsWriting(true)} className="bg-[#58CC02] text-white px-4 py-2.5 rounded-xl font-black shadow-[0_4px_0_0_#46A302] hover:brightness-105 active:shadow-none active:translate-y-1 transition-all text-sm">+ 새 일기</button>
            </div>
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <input type="text" placeholder="제목으로 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#1CB0F6] outline-none font-bold" />
                <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
              </div>
              <button onClick={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')} className="px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl font-black text-sm hover:bg-gray-50 flex items-center gap-2">{sortOrder === 'DESC' ? '최신순 ↓' : '오래된순 ↑'}</button>
            </div>
            <div className="flex flex-col gap-4 min-h-[400px]">
              {currentItems.length > 0 ? currentItems.map(diary => (
                <div key={diary.id} onClick={() => handleReadDiary(diary.id)} className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-[#1CB0F6] cursor-pointer group shadow-sm">
                  <div className="text-3xl bg-[#F7F7F7] w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-[#DDF4FF]">{diary.mood}</div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-[#1CB0F6] uppercase">{diary.diary_date || (diary as any).diaryDate}</div>
                    <div className="font-black text-gray-700 text-lg leading-tight">{diary.title}</div>
                  </div>
                  <div className="text-gray-300 font-black text-xl group-hover:text-[#1CB0F6]">→</div>
                </div>
              )) : <div className="text-center py-20 text-gray-400 font-bold bg-white border-2 border-dashed border-gray-200 rounded-3xl">결과가 없습니다.</div>}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 pb-10">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center font-black text-gray-400 disabled:opacity-30">＜</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl font-black ${currentPage === i + 1 ? 'bg-[#1CB0F6] text-white' : 'bg-white border-2 border-gray-100 text-gray-400'}`}>{i + 1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center font-black text-gray-400 disabled:opacity-30">＞</button>
              </div>
            )}
          </motion.div>
        )}

        {/* 프로필 탭 */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[600px]">
            <h2 className="text-3xl font-black text-[#4B4B4B] mb-8 px-2">프로필 👤</h2>
            <div className="bg-white border-2 border-gray-200 rounded-[32px] p-8 shadow-sm flex flex-col gap-4">
              <ProfileInfo label="Name" value={user?.name || "미설정"} />
              <ProfileInfo label="User ID" value={user?.userId || "미설정"} />
              <ProfileInfo label="Nickname" value={user?.nickname || "미설정"} />
              <ProfileInfo label="Current Mode" value={user?.mode || "NORMAL"} />
            </div>
          </motion.div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[600px]">
            <h2 className="text-3xl font-black text-[#4B4B4B] mb-8 px-2">환경 설정 ⚙️</h2>
            <div className="bg-white border-2 border-gray-200 rounded-[32px] p-8 shadow-sm">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 block">인터페이스 모드 선택</label>
              <div className="flex flex-col gap-4">
                <ModeButton mode="EASY" currentMode={user?.mode} icon="🌱" title="이지 모드 (Easy)" desc="간편한 출석체크 기능만 제공합니다." onClick={() => handleChangeMode('EASY')} />
                <ModeButton mode="NORMAL" currentMode={user?.mode} icon="📖" title="노멀 모드 (Normal)" desc="일기 쓰기와 상세 기록 관리가 가능합니다." onClick={() => handleChangeMode('NORMAL')} />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* 우측 정보 패널 */}
      <aside className="hidden lg:block w-80 fixed right-0 h-full p-6 border-l-2 border-gray-100 bg-white overflow-y-auto">
        <div className="flex items-center gap-3 p-5 bg-[#F7F9FA] rounded-[28px] border-2 border-gray-100 mb-8 shadow-sm">
          <div className="w-10 h-10 bg-[#1CB0F6] rounded-full flex items-center justify-center text-white font-black">{user?.name?.[0] || user?.userId?.[0] || 'U'}</div>
          <div className="flex flex-col flex-1">
            <span className="font-black text-sm text-gray-700">{user?.name || user?.userId}님</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit ${isEasyMode ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{user?.mode || 'NORMAL'} Mode</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-10 px-2 text-center">
          <Stat icon="🇰🇷" value="KO" />
          <Stat icon="🔥" value={user?.diaryStreak || 0} color="text-[#FF9600]" />
          <Stat icon="💎" value={500} color="text-[#1CB0F6]" />
          <Stat icon="❤️" value={5} color="text-[#FF4B4B]" />
        </div>
        <div className="border-2 border-gray-200 rounded-[24px] p-6 bg-white shadow-sm">
          <h3 className="font-black mb-2 text-lg text-[#4B4B4B]">오늘의 미션</h3>
          <p className="text-sm font-bold text-gray-400 mb-4 tracking-tight">{isEasyMode ? "버튼을 눌러 안부를 전하세요!" : "매일 일기를 쓰고 리워드를 받으세요!"}</p>
          <button className="w-full py-3 bg-[#1CB0F6] text-white rounded-2xl font-black text-sm shadow-[0_4px_0_0_#1499DA] active:translate-y-1 active:shadow-none transition-all">미션 확인하기</button>
        </div>
      </aside>

      {/* 컴포넌트 */}
      <DiaryWriteModal 
        isOpen={isWriting} 
        onClose={() => setIsWriting(false)} 
        onSave={handleSaveDiary} 
        newDiary={newDiary} 
        setNewDiary={setNewDiary} 
      />

      <DiaryDetailModal 
        diary={selectedDiary} 
        onClose={() => { setSelectedDiary(null); setIsDeleteConfirm(false); }} 
        onDelete={handleDeleteDiary} 
        isDeleteConfirm={isDeleteConfirm} 
        setIsDeleteConfirm={setIsDeleteConfirm} 
      />
    </div>
  );
};

// 보조 UI 컴포넌트
const SidebarItem = ({ icon, label, active = false, onClick, disabled = false }: any) => (
  <button onClick={onClick} disabled={disabled} className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-[17px] transition-all border-2 w-full text-left ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 border-transparent'} ${active && !disabled ? 'bg-[#DDF4FF] text-[#1CB0F6] border-[#84D8FF]' : 'text-[#777]'}`}><span className="text-2xl">{icon}</span> {label}</button>
);
const ProfileInfo = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-[#F7F9FA] border-2 border-gray-100 rounded-2xl p-5"><span className="text-xs font-black text-[#1CB0F6] uppercase tracking-widest">{label}</span><h3 className="text-2xl font-black text-[#4B4B4B]">{value}</h3></div>
);
const ModeButton = ({ mode, currentMode, icon, title, desc, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-5 p-6 rounded-[24px] border-2 transition-all text-left ${currentMode === mode ? 'border-[#1CB0F6] bg-[#DDF4FF]' : 'border-gray-100 hover:border-gray-300'}`}><div className="text-4xl bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">{icon}</div><div className="flex-1"><h4 className="font-black text-xl text-gray-700">{title}</h4><p className="text-sm font-bold text-gray-400">{desc}</p></div>{currentMode === mode && <div className="text-[#1CB0F6] text-2xl font-black">✓</div>}</button>
);
const Stat = ({ icon, value, color = "text-gray-700" }: any) => (
  <div className="flex flex-col items-center gap-1"><span className="text-xl lg:text-2xl">{icon}</span><span className={`font-black text-xs lg:text-sm ${color}`}>{value}</span></div>
);

export default DashboardPage;