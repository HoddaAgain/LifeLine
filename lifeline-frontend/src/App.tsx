// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/Mainpage';
import AuthPage from './auth/Authpage';
import { useUserStore } from './store/useUserStore';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  const { isLoggedIn, user } = useUserStore();

  return (
    <Router>
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<MainPage />} />

      
        <Route 
          path="/auth" 
          element={isLoggedIn ? <Navigate to="/Dashboard" /> : <AuthPage />} 
        />

        <Route 
          path="/Dashboard" 
          element={isLoggedIn ? <DashboardPage key={user?.userId ?? 'dashboard'} /> : <Navigate to="/auth" />} 
        />

      
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
