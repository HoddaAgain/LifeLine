import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { authapi } from '../api/authapi';
import { jwtDecode } from 'jwt-decode'; // 토큰 해독 라이브러리 추가
import { 
  type User, 
  type RegisterRequest, 
  type LoginResponse, 
  type CommonResponse 
} from '../types/index'; 
import { useQueryClient } from '@tanstack/react-query';
const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setLogin } = useUserStore();
  const queryClient = useQueryClient();
  const [isLoginView, setIsLoginView] = useState(searchParams.get('mode') !== 'signup');
  
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    nickname: '',
    emergencyContact: '',
    birthDate: '',
    mode: 'NORMAL' as 'EASY' | 'NORMAL',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLoginView) {
        
        const response = await authapi.login({
          userId: formData.userId,
          password: formData.password,
        });

        const apiRes = (response.data as any) as CommonResponse<LoginResponse>;
        
        if (apiRes && apiRes.data) {
          const { accessToken, mode } = apiRes.data;
          
          
          

          let decoded: any = {};
          try {
            
            decoded = jwtDecode(accessToken);
            
          } catch (decodeError) {
          }

          // 3. User 객체 생성 (토큰에 데이터가 없다면 응답값이나 입력값을 활용)
          const userData: User = {
            // 토큰에 id가 있으면 사용, 없으면 입력한 userId 활용
            id: decoded.id || 0, 
            userId: decoded.userId || formData.userId,
            name: decoded.name || formData.userId, // 이름이 없으면 아이디로 대체
            nickname: decoded.nickname || '',
            mode: (mode || decoded.mode || 'NORMAL') as 'EASY' | 'NORMAL',
            emergencyContact: decoded.emergencyContact || '',
            birthDate: decoded.birthDate || '',
            survivalStreak: 0,
            diaryStreak: decoded.diaryStreak || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // 4. 스토어 저장 및 이동
          queryClient.clear();
          setLogin(userData, accessToken);
          
          // ID가 undefined인 문제를 해결하기 위해 안전한 필드(name 또는 userId) 출력
          showToast(`${userData.name || userData.userId}님 환영합니다!`, 'success');
          setTimeout(() => navigate('/dashboard'), 500);
        }
      } else {
        // 회원가입 로직
        const signUpData: RegisterRequest = {
          userId: formData.userId,
          password: formData.password,
          name: formData.name,
          mode: formData.mode,
          emergencyContact: formData.emergencyContact,
          birthDate: formData.birthDate,
        };
        
        await authapi.register(signUpData);
        showToast('회원가입 성공! 로그인해주세요.', 'success');
        setIsLoginView(true);
      }
    } catch (error: any) {
      console.error("인증 에러:", error);
      showToast(error.response?.data?.message || '인증에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4 font-sans text-[#4B4B4B]">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className={`fixed top-0 z-[200] px-6 py-3 rounded-2xl font-black shadow-xl border-2 ${
              toast.type === 'success' ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1CB0F6]' : 'bg-red-50 border-red-200 text-red-500'
            }`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-[480px] bg-white border-2 border-gray-200 rounded-[32px] p-10 shadow-sm">
        
        <div className="text-center mb-10">
          <h1 className="text-[#1CB0F6] text-4xl font-black mb-2 tracking-tighter">LIFELINE</h1>
          <p className="text-gray-400 font-bold">{isLoginView ? '반가워요!' : '새로운 계정 만들기'}</p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <Input label="아이디" type="text" value={formData.userId} 
            onChange={(val) => setFormData({ ...formData, userId: val })} placeholder="아이디를 입력하세요" />
          <Input label="비밀번호" type="password" value={formData.password} 
            onChange={(val) => setFormData({ ...formData, password: val })} placeholder="비밀번호를 입력하세요" />

          {!isLoginView && (
            <div className="flex flex-col gap-4 mt-2">
              <Input label="이름" type="text" value={formData.name} onChange={(val) => setFormData({ ...formData, name: val })} placeholder="본명" />
              <Input label="닉네임" type="text" value={formData.nickname} onChange={(val) => setFormData({ ...formData, nickname: val })} placeholder="사용할 닉네임" />
              <Input label="비상연락처" type="text" value={formData.emergencyContact} onChange={(val) => setFormData({ ...formData, emergencyContact: val })} placeholder="010-0000-0000" />
              <Input label="생년월일" type="date" value={formData.birthDate} onChange={(val) => setFormData({ ...formData, birthDate: val })} />
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-gray-500 ml-2">모드 선택</label>
                <div className="flex gap-2">
                  {(['NORMAL', 'EASY'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setFormData({ ...formData, mode: m })}
                      className={`flex-1 py-3.5 rounded-2xl font-black border-2 transition-all ${
                        formData.mode === m ? 'border-[#1CB0F6] bg-[#DDF4FF] text-[#1CB0F6]' : 'border-gray-100 text-gray-400'
                      }`}>
                      {m === 'NORMAL' ? '노멀' : '이지'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="mt-6 w-full py-4 bg-[#1CB0F6] text-white rounded-2xl font-black text-lg shadow-[0_5px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all">
            {isLoginView ? '로그인' : '회원가입 완료'}
          </button>
        </form>

        <div className="mt-8 text-center border-t-2 border-gray-50 pt-6">
          <button onClick={() => setIsLoginView(!isLoginView)} className="text-gray-400 font-black hover:text-[#1CB0F6] transition-colors">
            {isLoginView ? '아직 계정이 없으신가요?' : '이미 계정이 있나요? 로그인'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const Input = ({ label, type, value, onChange, placeholder }: InputProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-black text-gray-500 ml-2">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder} 
      required
      className="w-full px-5 py-3.5 bg-[#F7F9FA] border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-[#1CB0F6] transition-all placeholder:text-gray-300" 
    />
  </div>
);

export default AuthPage;
