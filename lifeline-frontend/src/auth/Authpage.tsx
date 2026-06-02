import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
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
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyDetailOpen, setIsPrivacyDetailOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  
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

  useEffect(() => {
    setIsLoginView(searchParams.get('mode') !== 'signup');
  }, [searchParams]);

  useEffect(() => {
    const syncTermsState = () => {
      setIsTermsOpen(window.location.hash === '#terms');
    };

    syncTermsState();
    window.addEventListener('popstate', syncTermsState);

    return () => window.removeEventListener('popstate', syncTermsState);
  }, []);

  const openTerms = () => {
    setIsTermsOpen(true);
    if (window.location.hash !== '#terms') {
      window.history.pushState(
        { termsOpen: true },
        '',
        `${window.location.pathname}${window.location.search}#terms`
      );
    }
  };

  const closeTerms = () => {
    setIsPrivacyDetailOpen(false);

    if (window.location.hash === '#terms') {
      window.history.back();
      return;
    }

    setIsTermsOpen(false);
  };

  const moveToAuthMode = (mode: 'login' | 'signup') => {
    if (window.location.hash === '#terms') {
      window.history.back();
    }

    setIsTermsOpen(false);
    setIsPrivacyDetailOpen(false);
    setHasAcceptedTerms(false);
    navigate(mode === 'signup' ? '/auth?mode=signup' : '/auth?mode=login');
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupBackButton = async () => {
      const handle = await CapacitorApp.addListener('backButton', () => {
        if (isPrivacyDetailOpen) {
          setIsPrivacyDetailOpen(false);
          return;
        }

        if (isTermsOpen) {
          setIsTermsOpen(false);
          if (window.location.hash === '#terms') {
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
          }
          return;
        }

        if (!isLoginView) {
          setHasAcceptedTerms(false);
          navigate('/auth?mode=login');
          return;
        }

        CapacitorApp.exitApp();
      });

      return handle;
    };

    let cleanup: (() => void) | undefined;
    setupBackButton().then((handle) => {
      cleanup = () => handle.remove();
    });

    return () => cleanup?.();
  }, [isLoginView, isPrivacyDetailOpen, isTermsOpen, navigate]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getMissingFieldMessage = () => {
    const requiredFields = isLoginView
      ? [
          { key: 'userId', label: '아이디' },
          { key: 'password', label: '비밀번호' },
        ]
      : [
          { key: 'userId', label: '아이디' },
          { key: 'password', label: '비밀번호' },
          { key: 'name', label: '이름' },
          { key: 'emergencyContact', label: '비상연락처' },
          { key: 'birthDate', label: '생년월일' },
        ];

    const missingField = requiredFields.find(({ key }) => {
      const value = formData[key as keyof typeof formData];
      return typeof value === 'string' && value.trim() === '';
    });

    return missingField ? `${missingField.label}을(를) 입력해주세요.` : null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingMessage = getMissingFieldMessage();
    if (missingMessage) {
      showToast(missingMessage, 'error');
      return;
    }

    if (!isLoginView && !hasAcceptedTerms) {
      showToast('개인정보 수집 및 이용에 동의해주세요.', 'error');
      openTerms();
      return;
    }

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
        navigate('/auth?mode=login', { replace: true });
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

        <form onSubmit={handleAuth} noValidate className="flex flex-col gap-4">
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

              <div className="rounded-2xl border-2 border-gray-100 bg-[#F7F9FA] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-gray-600">개인정보 및 이용약관</p>
                    <p className={`mt-1 text-xs font-bold ${hasAcceptedTerms ? 'text-[#58CC02]' : 'text-gray-400'}`}>
                      {hasAcceptedTerms ? '동의 완료' : '회원가입 전 수집 항목 확인이 필요합니다.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openTerms}
                    className="shrink-0 rounded-xl border-2 border-[#1CB0F6] bg-white px-4 py-2 text-sm font-black text-[#1CB0F6] transition-all hover:bg-[#DDF4FF]"
                  >
                    약관 보기
                  </button>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="mt-6 w-full py-4 bg-[#1CB0F6] text-white rounded-2xl font-black text-lg shadow-[0_5px_0_0_#1899D6] active:translate-y-1 active:shadow-none transition-all">
            {isLoginView ? '로그인' : '회원가입 완료'}
          </button>
        </form>

        <div className="mt-8 text-center border-t-2 border-gray-50 pt-6">
          <button
            onClick={() => moveToAuthMode(isLoginView ? 'signup' : 'login')}
            className="text-gray-400 font-black hover:text-[#1CB0F6] transition-colors"
          >
            {isLoginView ? '아직 계정이 없으신가요?' : '이미 계정이 있나요? 로그인'}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isTermsOpen && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-[460px] rounded-[28px] border-2 border-gray-200 bg-white p-6 shadow-2xl"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
            >
              <div className="flex items-center gap-3">
                {isPrivacyDetailOpen && (
                  <button
                    type="button"
                    onClick={() => setIsPrivacyDetailOpen(false)}
                    className="rounded-xl border-2 border-gray-200 px-3 py-2 text-sm font-black text-gray-500"
                  >
                    이전
                  </button>
                )}
                <h2 className="text-2xl font-black text-[#1CB0F6]">
                  {isPrivacyDetailOpen ? '개인정보처리방침' : '개인정보 수집 및 이용 안내'}
                </h2>
              </div>
              {!isPrivacyDetailOpen && (
                <p className="mt-2 text-sm font-bold leading-6 text-gray-500">
                  LifeLine은 회원가입과 서비스 제공을 위해 아래 정보를 서버에 저장하고 사용합니다.
                </p>
              )}
              <div className="mt-4 max-h-[340px] overflow-y-auto rounded-2xl bg-[#F7F9FA] p-4 text-sm font-bold leading-6 text-gray-600">
                {isPrivacyDetailOpen ? (
                  <>
                    <p className="text-xs text-gray-400">시행일: 2026년 6월 2일</p>
                    <p className="mt-3">
                      LifeLine은 사용자의 개인정보를 중요하게 생각하며, 서비스 제공에 필요한 최소한의 개인정보를 수집하고 안전하게 관리하기 위해 본 개인정보처리방침을 공개합니다.
                    </p>
                    <p className="mt-3">
                      본 방침은 Google Play에 게시되는 LifeLine 앱과 앱에서 제공하는 생존 체크인, 일기, 미션 기능에 적용됩니다.
                    </p>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">1. 수집하는 개인정보 항목</h3>
                      <p className="mt-2">LifeLine은 회원가입 및 서비스 제공을 위해 다음 정보를 수집할 수 있습니다.</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>회원가입 정보: 아이디, 암호화된 비밀번호, 이름</li>
                        <li>사용자 안전 확인 정보: 생년월일, 비상연락처</li>
                        <li>서비스 이용 정보: 생존 체크인 시간, 생존 상태, 미션 수행 상태</li>
                        <li>일기 정보: 일기 제목, 내용, 감정, 작성 날짜, 이미지 URL</li>
                        <li>기술 정보: 앱 오류 기록, 접속 시각 등 서비스 운영에 필요한 기본 로그</li>
                      </ul>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">2. 개인정보의 이용 목적</h3>
                      <p className="mt-2">수집한 개인정보는 다음 목적을 위해 사용됩니다.</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>회원가입, 로그인, 사용자 식별</li>
                        <li>생존 체크인, 일기 작성, 일일 미션 등 앱 기능 제공</li>
                        <li>장시간 미체크 상태 확인 및 안전 알림 기능 제공</li>
                        <li>서비스 오류 확인, 부정 이용 방지, 서비스 품질 개선</li>
                      </ul>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">3. 개인정보의 보관 기간</h3>
                      <p className="mt-2">
                        LifeLine은 서비스 제공에 필요한 기간 동안 개인정보를 보관합니다. 사용자가 계정 삭제를 요청하거나 서비스 이용 목적이 달성된 경우 관련 법령 또는 분쟁 대응을 위해 필요한 경우를 제외하고 개인정보를 삭제합니다.
                      </p>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">4. 개인정보의 제3자 제공</h3>
                      <p className="mt-2">
                        LifeLine은 사용자의 개인정보를 사용자의 동의 없이 외부에 판매하거나 제공하지 않습니다. 다만 법령에 따른 요청이 있거나 사용자가 사전에 동의한 경우에는 예외로 합니다.
                      </p>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">5. 개인정보 처리 위탁 및 외부 서비스</h3>
                      <p className="mt-2">
                        서비스 운영 과정에서 서버, 데이터베이스, 앱 배포 플랫폼 등 외부 서비스가 사용될 수 있습니다. 외부 서비스를 사용하는 경우 LifeLine은 개인정보가 안전하게 처리되도록 필요한 조치를 취합니다.
                      </p>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">6. 사용자의 권리</h3>
                      <p className="mt-2">사용자는 본인의 개인정보에 대해 열람, 수정, 삭제, 처리 정지를 요청할 수 있습니다.</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>계정 정보 수정 또는 삭제 요청</li>
                        <li>일기 등 사용자가 작성한 콘텐츠 삭제 요청</li>
                        <li>개인정보 처리에 대한 문의 또는 동의 철회 요청</li>
                      </ul>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">7. 개인정보 보호 조치</h3>
                      <p className="mt-2">
                        LifeLine은 비밀번호를 암호화하여 저장하고, 인증이 필요한 API에는 토큰 기반 인증을 적용합니다. 또한 개인정보 접근을 필요한 범위로 제한하기 위해 노력합니다.
                      </p>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">8. 아동의 개인정보</h3>
                      <p className="mt-2">
                        LifeLine은 관련 법령에서 별도 보호가 필요한 아동의 개인정보를 고의로 수집하지 않습니다. 아동의 개인정보가 수집된 사실을 확인한 경우 삭제 등 필요한 조치를 취합니다.
                      </p>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">9. 개인정보처리방침 변경</h3>
                      <p className="mt-2">
                        본 개인정보처리방침은 법령, 서비스 내용, 개인정보 처리 방식의 변경에 따라 수정될 수 있습니다. 중요한 변경이 있는 경우 앱 또는 서비스 화면을 통해 안내합니다.
                      </p>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">10. 문의</h3>
                      <p className="mt-2">
                        개인정보 처리와 관련한 문의는 Google Play 스토어에 등록된 개발자 연락처 또는 LifeLine 운영팀에 문의해 주시기 바랍니다.
                      </p>
                    </section>
                  </>
                ) : (
                  <>
                    <section>
                      <h3 className="font-black text-gray-800">수집하는 정보</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>아이디, 암호화된 비밀번호, 이름</li>
                        <li>생년월일, 비상연락처</li>
                        <li>생존 체크인 시간, 미션 수행 상태</li>
                        <li>작성한 일기의 제목, 내용, 감정, 날짜, 이미지 URL</li>
                      </ul>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">사용 목적</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>로그인 및 사용자 식별</li>
                        <li>생존 체크인, 일기, 미션 기능 제공</li>
                        <li>장시간 미체크 상태 확인 및 안전 알림 기능 제공</li>
                      </ul>
                    </section>
                    <section className="mt-4">
                      <h3 className="font-black text-gray-800">보관 및 동의</h3>
                      <p className="mt-2">
                        수집한 정보는 서비스 제공에 필요한 기간 동안 보관됩니다. 동의하지 않으면 회원가입을 진행할 수 없습니다.
                      </p>
                    </section>
                    <p className="mt-4">
                      자세한 내용은{' '}
                      <button
                        type="button"
                        onClick={() => setIsPrivacyDetailOpen(true)}
                        className="font-black text-[#1CB0F6] underline"
                      >
                        개인정보처리방침
                      </button>
                      에서 확인할 수 있습니다.
                    </p>
                  </>
                )}
              </div>
              {!isPrivacyDetailOpen && (
                <>
                  <p className="mt-5 text-center text-base font-black text-gray-700">위 개인정보 수집 및 이용에 동의하시겠습니까?</p>
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={closeTerms}
                      className="flex-1 rounded-2xl border-2 border-gray-200 py-3 font-black text-gray-400 transition-all hover:bg-gray-50"
                    >
                      동의하지 않음
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasAcceptedTerms(true);
                        closeTerms();
                      }}
                      className="flex-1 rounded-2xl bg-[#1CB0F6] py-3 font-black text-white shadow-[0_4px_0_0_#1899D6] transition-all active:translate-y-1 active:shadow-none"
                    >
                      동의합니다
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      className="w-full px-5 py-3.5 bg-[#F7F9FA] border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-[#1CB0F6] transition-all placeholder:text-gray-300" 
    />
  </div>
);

export default AuthPage;
