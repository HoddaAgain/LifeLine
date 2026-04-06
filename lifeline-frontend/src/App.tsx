// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/Mainpageex1';
import AuthPage from './auth/Authpage';
import { useUserStore } from './store/useUserStore';
import DashboardPage from './pages/DashboardPage';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
const App: React.FC = () => {
  
  const { isLoggedIn } = useUserStore();

  return (
    <Router>
      <Routes>
        {/* 메인 페이지*/}
        <Route path="/" element={<MainPage />} />

        {/* 2. 로그인/회원가입 페이지*/}
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/Dashboard" element={<DashboardPage />} />
        {/* <Route path="/health" element={<HealthPage />} /> */}

        {/*잘못된 주소 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;