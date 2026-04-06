import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {useUserStore} from '../store/useUserStore'; // 스토어 경로 확인 필요
import api from '../api/axios'; // axios 인스턴스
import { diaryApi } from '../api/diarys'; // 일기 API
import { type Diary } from '../types'; // 공통 타입

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  const { user, setLogout, setUser } = useUserStore() as any; 
  const isEasyMode = user?.mode === 'EASY';
  

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'diary' | 'settings' | 'profile'>('main');
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false); 
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null); 
  const [newDiary, setNewDiary] = useState({ title: '', content: '', mood: '😊' }); 
  
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, diaryRes] = await Promise.all([
          api.get('/api/auth/me'),
          diaryApi.getDiaries()
        ]);
        if (setUser) setUser(userRes.data);
        setDiaries(diaryRes.data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setUser]);

  // 커스텀 알림 
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

 
  const handleChangeMode = async (newMode: 'EASY' | 'NORMAL') => {
    try {
      await api.patch('/api/auth/mode', { mode: newMode });
      if (setUser) setUser({ ...user, mode: newMode });
      showToast(`${newMode === 'EASY' ? '이지' : '노멀'} 모드로 변경되었습니다!`, 'success');
      setActiveTab('main');
    } catch (error) {
      showToast('모드 변경에 실패했습니다.', 'error');
    }
  };

  const handleLogout = () => {
    setLogout();
    navigate('/');
  };

  // 5. 일기 저장 로직 (diaryApi 연동)
  const handleSaveDiary = async () => {
    if (!newDiary.title.trim() || !newDiary.content.trim()) {
      return showToast('제목과 내용을 모두 입력해주세요!', 'error');
    }
    
    try {
      const res = await diaryApi.createDiary({
        ...newDiary,
        createdAt: new Date().toISOString().split('T')[0] 
      });
      
      setDiaries([res.data, ...diaries]);
      setIsWriting(false);
      setNewDiary({ title: '', content: '', mood: '😊' });
      showToast('오늘의 기록이 저장되었습니다! ✨', 'success');
    } catch (error) {
      showToast('저장에 실패했습니다.', 'error');
    }
  };

  // 6. 일기 삭제 로직 (diaryApi 연동)
  const handleDeleteDiary = async (id: number) => {
    try {
      await diaryApi.deleteDiary(id);
      setDiaries(diaries.filter(d => d.id !== id));
      setSelectedDiary(null);
      setIsDeleteConfirm(false);
      showToast('기록이 삭제되었습니다.', 'info');
    } catch (error) {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-[#1CB0F6]">LOADING...</div>;

  return (
    <div className="flex min-h-screen bg-[#F7F7F7] font-sans overflow-x-hidden text-[#4B4B4B]">
      
      {/* 알림  */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-[350px] px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-2xl shadow-xl border-2 font-black text-center pointer-events-auto
                ${toast.type === 'success' ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]' : 
                  toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-500' : 
                  'bg-white border-gray-200 text-gray-600'}`}
            >
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

      {/* 사이드바  */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-[55] lg:hidden" />
        )}
      </AnimatePresence>

      {/* 왼쪽 사이드바 */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r-2 border-gray-200 flex flex-col p-4 z-[60] transition-transform duration-300 ease-in-out w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="text-[#1CB0F6] font-black text-3xl px-4 mb-10 mt-2 cursor-pointer" onClick={() => setActiveTab('main')}>LIFELINE</div>
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem icon="🏠" label="메인" active={activeTab === 'main'} onClick={() => { setActiveTab('main'); setIsSidebarOpen(false); }} />
          <SidebarItem 
            icon="📖" label="일기장" 
            active={activeTab === 'diary'} 
            disabled={isEasyMode}
            onClick={() => { 
              if(isEasyMode) return showToast('이지 모드에서는 생존신고만 가능합니다.', 'info');
              setActiveTab('diary'); 
              setIsSidebarOpen(false); 
            }} 
          />
          <SidebarItem icon="👤" label="프로필" 
            active={activeTab === 'profile'} 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
          
          />
          <SidebarItem 
            icon="⚙️" label="설정" 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
          />
        </nav>
        <div className="p-4 border-t-2 border-gray-100 flex flex-col gap-3">
          <button onClick={handleLogout} className="text-xs font-black text-gray-400 hover:text-red-500 transition-colors uppercase text-left">Logout</button>
        </div>
      </aside>

      {/* 중앙 영역 */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-10 lg:pt-10 px-4 lg:ml-64 lg:mr-80 min-w-0 transition-all">
        
        {/* 메인 탭 */}
        {activeTab === 'main' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[600px] flex flex-col items-center">
            <div className="w-full bg-[#1CB0F6] rounded-[24px] p-8 lg:p-12 text-white mb-12 shadow-lg relative overflow-hidden">
              <h2 className="text-3xl font-black relative z-10 leading-tight">
                {user?.name || user?.userId || "사용자"}님,
                {isEasyMode ? " 반가워요!" : " 오늘도 기록해볼까요?"}
              </h2>
            </div>
            {isEasyMode ? (
              <div className="flex flex-col items-center gap-8 py-10 w-full">
                <div className="text-9xl animate-bounce mb-4">🌱</div>
                <button 
                  onClick={() => { setHasCheckedIn(true); showToast('출석 완료!', 'success'); }}
                  disabled={hasCheckedIn}
                  className={`w-full max-w-sm py-6 rounded-3xl font-black text-2xl transition-all shadow-[0_8px_0_0_#46A302] active:shadow-none active:translate-y-2
                    ${hasCheckedIn ? 'bg-gray-200 text-gray-400 shadow-none translate-y-2' : 'bg-[#58CC02] text-white hover:brightness-105'}`}
                >
                  {hasCheckedIn ? '출석 완료!' : '출석체크하기'}
                </button>
              </div>
            ) : (
              <div className="text-gray-300 font-black text-xl italic mt-10 flex flex-col items-center gap-4">
                <span className="text-8xl">🐣</span>
                기록은 당신을 성장하게 합니다.
              </div>
            )}
          </motion.div>
        )}

        {/* 일기장 탭 */}
        {activeTab === 'diary' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-[600px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-black text-[#4B4B4B]">내 일기장 📖</h2>
              <button 
                onClick={() => setIsWriting(true)}
                className="bg-[#58CC02] text-white px-4 py-2.5 rounded-xl font-black shadow-[0_4px_0_0_#46A302] hover:brightness-105 active:shadow-none active:translate-y-1 transition-all text-sm"
              >
                + 새 일기
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {diaries.length > 0 ? diaries.map(diary => (
                <div key={diary.id} onClick={() => { setSelectedDiary(diary); setIsDeleteConfirm(false); }} 
                  className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-[#1CB0F6] cursor-pointer transition-all group shadow-sm">
                  <div className="text-3xl bg-[#F7F7F7] w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-[#DDF4FF] transition-colors">{diary.emotion}</div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-[#1CB0F6] uppercase tracking-widest">{diary.date}</div>
                    <div className="font-black text-gray-700 text-lg leading-tight">{diary.title}</div>
                  </div>
                  <div className="text-gray-300 font-black text-xl group-hover:text-[#1CB0F6]">→</div>
                </div>
              )) : (
                <div className="text-center py-20 text-gray-400 font-bold bg-white border-2 border-dashed border-gray-200 rounded-3xl">기록이 없습니다.</div>
              )}
            </div>
          </motion.div>
        )}


        {/*프로필 탭*/ }
        {activeTab === 'profile' &&(
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[600px]">
            <h2 className="text-3xl font-black text-[#4B4B4B] mb-8 px-2">프로필 👤</h2>
            <div className="bg-white border-2 border-gray-200 rounded-[32px] p-8 shadow-sm flex flex-col gap-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 block">내 정보</label>
              
              <div className="bg-[#F7F9FA] border-2 border-gray-100 rounded-2xl p-5">
                <span className="text-xs font-black text-[#1CB0F6] uppercase tracking-widest">Name</span>
                <h3 className="text-2xl font-black text-[#4B4B4B]">{user?.name}</h3>
              </div>

              <div className="bg-[#F7F9FA] border-2 border-gray-100 rounded-2xl p-5">
                <span className="text-xs font-black text-[#1CB0F6] uppercase tracking-widest">ID</span>
                <h3 className="text-2xl font-black text-[#4B4B4B]">{user?.nickname}</h3>
              </div>

              <div className="bg-[#F7F9FA] border-2 border-gray-100 rounded-2xl p-5">
                <span className="text-xs font-black text-[#1CB0F6] uppercase tracking-widest">Current Mode</span>
                <h3 className="text-2xl font-black text-[#4B4B4B]">{user?.mode}</h3>
              </div>
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
                <button onClick={() => handleChangeMode('EASY')} className={`flex items-center gap-5 p-6 rounded-[24px] border-2 transition-all text-left ${user?.mode === 'EASY' ? 'border-[#1CB0F6] bg-[#DDF4FF]' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div className="text-4xl bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">🌱</div>
                  <div className="flex-1">
                    <h4 className="font-black text-xl text-gray-700">이지 모드 (Easy)</h4>
                    <p className="text-sm font-bold text-gray-400">간편한 출석체크 기능만 제공합니다.</p>
                  </div>
                  {user?.mode === 'EASY' && <div className="text-[#1CB0F6] text-2xl font-black">✓</div>}
                </button>
                <button onClick={() => handleChangeMode('NORMAL')} className={`flex items-center gap-5 p-6 rounded-[24px] border-2 transition-all text-left ${user?.mode === 'NORMAL' ? 'border-[#1CB0F6] bg-[#DDF4FF]' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div className="text-4xl bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">📖</div>
                  <div className="flex-1">
                    <h4 className="font-black text-xl text-gray-700">노멀 모드 (Normal)</h4>
                    <p className="text-sm font-bold text-gray-400">일기 쓰기와 상세 기록 관리가 가능합니다.</p>
                  </div>
                  {user?.mode === 'NORMAL' && <div className="text-[#1CB0F6] text-2xl font-black">✓</div>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* 오른쪽 정보 패널 */}
      <aside className="hidden lg:block w-80 fixed right-0 h-full p-6 border-l-2 border-gray-100 bg-white overflow-y-auto">
        <div className="flex items-center gap-3 p-5 bg-[#F7F9FA] rounded-[28px] border-2 border-gray-100 mb-8 shadow-sm">
          <div className="w-10 h-10 bg-[#1CB0F6] rounded-full flex items-center justify-center text-white font-black">
            {user?.name?.[0] || user?.userId?.[0] || 'U'}
          </div>
          <div className="flex flex-col flex-1">
            
            <span className="font-black text-sm text-gray-700">
              {user?.name || user?.userId || "Guest"}님
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit ${isEasyMode ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {user?.mode || 'NORMAL'} Mode
            </span>
          </div>
          <button onClick={handleLogout} className="text-xs font-black text-gray-400 hover:text-red-500 uppercase">Logout</button>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-10 px-2 text-center">
          <Stat icon="🇰🇷" value="KO" />
          <Stat icon="🔥" value={user?.diaryStreak || 0} color="text-[#FF9600]" />
          <Stat icon="💎" value={500} color="text-[#1CB0F6]" />
          <Stat icon="❤️" value={5} color="text-[#FF4B4B]" />
        </div>

        <div className="border-2 border-gray-200 rounded-[24px] p-6 bg-white shadow-sm">
          <h3 className="font-black mb-2 text-lg text-[#4B4B4B]">오늘의 미션</h3>
          <p className="text-sm font-bold text-gray-400 mb-4 tracking-tight">
            {isEasyMode ? "버튼을 눌러 안부를 전하세요!" : "매일 일기를 쓰고 리워드를 받으세요!"}
          </p>
          <button className="w-full py-3 bg-[#1CB0F6] text-white rounded-2xl font-black text-sm shadow-[0_4px_0_0_#1499DA] active:translate-y-1 active:shadow-none transition-all">
            미션 확인하기
          </button>
        </div>
      </aside>

      {/* 일기 작성 모달 */}
      <AnimatePresence>
        {isWriting && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWriting(false)} className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} 
              className="fixed inset-x-0 bottom-0 top-12 lg:top-20 bg-white rounded-t-[40px] z-[101] shadow-2xl p-6 lg:p-10 flex flex-col max-w-[800px] mx-auto overflow-hidden">
              <div className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <button onClick={() => setIsWriting(false)} className="text-gray-400 font-black text-lg">취소</button>
                <h3 className="text-xl font-black text-[#4B4B4B]">새로운 기록 ✍️</h3>
                <button onClick={handleSaveDiary} className="text-[#1CB0F6] font-black text-lg active:scale-95">완료</button>
              </div>
              <div className="flex justify-start sm:justify-center gap-3 py-4 mb-4 overflow-x-auto flex-shrink-0 no-scrollbar">
                {['😊', '✨', '😭', '😡', '😴', '😋', '🤒'].map(e => (
                  <button key={e} onClick={() => setNewDiary({...newDiary, mood: e})} 
                    className={`text-4xl p-4 rounded-[24px] transition-all flex-shrink-0 ${newDiary.mood === e ? 'bg-[#DDF4FF] border-2 border-[#1CB0F6] scale-105 shadow-md' : 'bg-gray-50 border-2 border-transparent'}`}>{e}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 no-scrollbar">
                <input type="text" placeholder="제목을 입력하세요" value={newDiary.title} onChange={e => setNewDiary({...newDiary, title: e.target.value})} 
                  className="text-2xl lg:text-3xl font-black outline-none border-b-2 border-gray-100 pb-4 focus:border-[#1CB0F6] transition-colors w-full" />
                <textarea placeholder="오늘은 어떤 일이 있었나요?" value={newDiary.content} onChange={e => setNewDiary({...newDiary, content: e.target.value})} 
                  className="flex-1 text-lg font-bold text-gray-500 outline-none resize-none leading-relaxed min-h-[150px]" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 일기 상세보기 모달 */}
      <AnimatePresence>
        {selectedDiary && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDiary(null)} className="fixed inset-0 bg-black/50 z-[110] backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-x-4 top-20 bottom-20 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[600px] bg-white rounded-[32px] z-[111] p-8 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex justify-between items-start mb-6 flex-shrink-0">
                <div>
                  <span className="text-[#1CB0F6] font-black text-sm uppercase tracking-widest">{selectedDiary.date}</span>
                  <h3 className="text-2xl lg:text-3xl font-black text-gray-700 mt-1 leading-tight">{selectedDiary.title}</h3>
                </div>
                <button onClick={() => setSelectedDiary(null)} className="text-gray-300 hover:text-gray-900 text-2xl font-black">✕</button>
              </div>
              <div className="flex items-center gap-4 mb-6 p-5 bg-[#F7F9FA] rounded-[24px] border-2 border-gray-100 flex-shrink-0">
                <span className="text-5xl">{selectedDiary.emotion}</span>
                <span className="font-black text-gray-400 italic">이날의 기분</span>
              </div>
              <div className="flex-1 overflow-y-auto text-lg leading-relaxed text-gray-600 font-bold px-2 whitespace-pre-wrap no-scrollbar">
                {selectedDiary.content}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-50 flex flex-col gap-3 flex-shrink-0 transition-all">
                <AnimatePresence mode="wait">
                  {!isDeleteConfirm ? (
                    <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-4 w-full">
                      <button onClick={() => setIsDeleteConfirm(true)} className="flex-1 py-4 rounded-2xl font-black text-red-500 bg-red-50 hover:bg-red-100 transition-all">삭제하기</button>
                      <button onClick={() => setSelectedDiary(null)} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">닫기</button>
                    </motion.div>
                  ) : (
                    <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-3 w-full bg-red-50 p-4 rounded-[24px] border-2 border-red-100">
                      <p className="text-center font-black text-red-600 mb-1">정말 이 기록을 삭제할까요?</p>
                      <div className="flex gap-3">
                        <button onClick={() => handleDeleteDiary(selectedDiary.id)} className="flex-1 py-3 rounded-xl font-black text-white bg-red-500 hover:bg-red-600 shadow-[0_4px_0_0_#BC2F2F] active:translate-y-1 active:shadow-none">응, 삭제할래</button>
                        <button onClick={() => setIsDeleteConfirm(false)} className="flex-1 py-3 rounded-xl font-black text-gray-500 bg-white border-2 border-gray-200">아니, 취소!</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 서브 컴포넌트 ---
const SidebarItem = ({ icon, label, active = false, onClick, disabled = false }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-[17px] transition-all border-2 w-full text-left 
      ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 hover:text-gray-900 border-transparent'} 
      ${active && !disabled ? 'bg-[#DDF4FF] text-[#1CB0F6] border-[#84D8FF]' : 'text-[#777]'}`}
  >
    <span className="text-2xl">{icon}</span> {label}
  </button>
);

const Stat = ({ icon, value, color = "text-gray-700" }: any) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-xl lg:text-2xl">{icon}</span>
    <span className={`font-black text-xs lg:text-sm ${color}`}>{value}</span>
  </div>
);

export default DashboardPage;