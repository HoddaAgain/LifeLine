import React, { useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import backgroundVideo from '../assets/background.mp4';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, setLogout } = useUserStore();

 
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard'); 
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* 배경 영상 영역 */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
         
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
          로그인 배경 영상
        </video>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      </div>

      {/* 헤더 영역 */}
      <header className="w-full flex justify-center z-50">
        <div className="w-full max-w-[1200px] px-8 py-8 flex justify-between items-center">
          <div className="text-white font-black text-2xl tracking-tighter drop-shadow-md">
            LIFELINE
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-5 py-2 rounded-full border border-white/20 shadow-lg">
            {isLoggedIn && user ? (
              <span className="text-sm font-bold text-white/90">{user?.mode}모드</span>
            ) : (
              <span className="text-sm font-bold text-white/90">로그인이 필요합니다.</span>
            )}
            <div className="w-[2px] h-4 bg-white/30" />
            
            {isLoggedIn && user ? (
              <div className="flex items-center gap-3">
                <span className="font-black text-white">{user.name}님</span>
                <button 
                  onClick={() => { setLogout(); navigate('/'); }}
                  className="text-xs font-bold bg-red-500/80 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-all"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/auth?mode=login')}
                className="text-sm font-black text-white hover:text-[#1CB0F6] transition-all"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 메인  영역 */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[1200px] px-8 z-10">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-black text-white mb-8 leading-[1.1] drop-shadow-2xl"
          >
            우리들의<br/>
            <span className="text-[#1CB0F6]">라이프라인</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white/90 mb-14 drop-shadow-lg"
          >
            열심히 살자
          </motion.p>

          <div className="flex gap-6 justify-center">
           {/* {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/Dashboard')} // 대시보드로 이동
                className="px-12 py-6 bg-[#1CB0F6] text-white rounded-full text-2xl font-black shadow-2xl transition-all"
              >
                대시보드로 가기
              </motion.button>
            ) : (*/}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth?mode=signup')}
                className="px-12 py-6 bg-white/20 backdrop-blur-md text-white rounded-full text-2xl font-black shadow-xl border border-white/30"
              >
                지금 시작하기
              </motion.button>
            
          </div>
        </div>
      </main>

      {/* 푸터 영역 */}
      <footer className="w-full flex justify-center z-50 mt-auto">
        <div className="w-full max-w-[1200px] px-8 py-10 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-2">
              <div className="text-white/80 font-black text-xl tracking-tighter">LIFELINE</div>
              <p className="text-xs font-medium text-white/50 leading-relaxed">
                © 2026 Lifeline. 모든 권리 보유.
              </p>
            </div>
            <div className="flex gap-6 text-sm font-bold text-white/60">
              <button className="hover:text-white">이용약관</button>
              <button className="hover:text-white">개인정보처리방침</button>
              <button className="hover:text-white">고객센터</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
//미완성