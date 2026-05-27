// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import MainPage from './pages/Mainpage';
import AuthPage from './auth/Authpage';
import { useUserStore } from './store/useUserStore';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  const { isLoggedIn, user } = useUserStore();
  const isNativeMobile = Capacitor.isNativePlatform();

  return (
    <Router>
      <Routes>
        {/* 메인 페이지 */}
        <Route
          path="/"
          element={
            isNativeMobile
              ? <Navigate to={isLoggedIn ? "/Dashboard" : "/auth"} replace />
              : <MainPage />
          }
        />

      
        <Route 
          path="/auth" 
          element={isLoggedIn ? <Navigate to="/Dashboard" /> : <AuthPage />} 
        />

        <Route 
          path="/Dashboard" 
          element={isLoggedIn ? <DashboardPage key={user?.userId ?? 'dashboard'} /> : <Navigate to="/auth" />} 
        />

      
        <Route path="*" element={<Navigate to={isNativeMobile ? "/auth" : "/"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
