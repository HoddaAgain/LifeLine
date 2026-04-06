import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';

const auroraVariants: Variants = {
  animate: {
    background: [
      'radial-gradient(circle at 10% 20%, #F0F8FF 0%, #E0F7FA 100%)',
      'radial-gradient(circle at 90% 80%, #E1F5FE 0%, #F0F8FF 100%)',
      'radial-gradient(circle at 50% 50%, #E0F7FA 0%, #E1F5FE 100%)',
      'radial-gradient(circle at 10% 20%, #F0F8FF 0%, #E0F7FA 100%)',
    ],
    transition: { duration: 15, ease: 'linear', repeat: Infinity },
  },
};

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, setLogout } = useUserStore();

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans"
      variants={auroraVariants}
      animate="animate"
    >
      {/* 상단 헤더 */}
      <header className="w-full flex justify-center z-50">
        <div className="w-full max-w-[1200px] px-8 py-8 flex justify-between items-center">
          {/* 로고 */}
          <div className="text-[#1CB0F6] font-black text-2xl tracking-tighter">
            LIFELINE
          </div>

          {/* 우상단 프로필 */}
          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md px-5 py-2 rounded-full border border-white/60 shadow-sm">
            <span className="text-sm font-bold text-[#666]">서비스 언어: 한국어 ▼</span>
            
            <div className="w-[2px] h-4 bg-gray-300" />
            
            {isLoggedIn && user ? (
              <div className="flex items-center gap-3">
                <span className="font-black text-[#333]">{user.name}님</span>
                <button 
                  onClick={() => { setLogout(); navigate('/'); }}
                  className="text-xs font-bold bg-red-400/80 text-white px-3 py-1.5 rounded-full hover:bg-red-500 transition-all active:scale-95"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/auth?mode=login')}
                className="text-sm font-black text-[#1CB0F6] hover:opacity-70 transition-all"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      {/*  메인 영역*/}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[1200px] px-8 z-10">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-black text-[#333] mb-8 leading-[1.1]"
          >
           우리들의<br/>
            <span className="text-[#1CB0F6]">라이프라인</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-[#666] mb-14"
          >
            열심히 살자
          </motion.p>

          <div className="flex gap-6 justify-center">
            {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/diary')}
                className="px-12 py-6 bg-[#1CB0F6] text-white rounded-full text-2xl font-black shadow-[0_20px_40px_-10px_rgba(28,176,246,0.4)] transition-all"
              >
                생존신고하기
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth?mode=signup')}
                className="px-12 py-6 bg-white text-[#1CB0F6] rounded-full text-2xl font-black shadow-xl border-2 border-[#1CB0F6]/10"
              >
                지금 시작하기
              </motion.button>
            )}
          </div>
        </div>
      </main>

      {/* 배경 장식  */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#FFF59D]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#E1F5FE]/40 rounded-full blur-[120px] pointer-events-none" />
      <footer className="w-full flex justify-center z-50 mt-auto">
        <div className="w-full max-w-[1200px] px-8 py-10 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* 왼쪽: 서비스 정보 */}
            <div className="flex flex-col gap-2">
              <div className="text-[#1CB0F6] font-black text-xl tracking-tighter opacity-80">
                LIFELINE
              </div>
              <p className="text-xs font-medium text-[#777] leading-relaxed">
                부산광역시 가야대로 동의대학교
                대표: 강신혁 | 사업자 등록번호: 000-0000-000
                © 2026 Lifeline. 모든 권리 보유.
              </p>
            </div>

            {/* 오른쪽: 약관 및 정책 링크 */}
            <div className="flex gap-6 text-sm font-bold text-[#666]">
              <button onClick={() => navigate('/terms')} className="hover:text-[#1CB0F6] transition-colors">
                이용약관
              </button>
              <button onClick={() => navigate('/privacy')} className="hover:text-[#1CB0F6] transition-colors">
                개인정보처리방침
              </button>
              <button onClick={() => navigate('/support')} className="hover:text-[#1CB0F6] transition-colors">
                고객센터
              </button>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default MainPage;