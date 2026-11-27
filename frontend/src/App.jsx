import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AuthProvider, useAuth } from './context/AuthContext';
import * as notificationService from './services/notificationService';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import DonorDashboardPage from './pages/DonorDashboardPage';
import NgoBrowsePage from './pages/NgoBrowsePage';
import RecommendationsPage from './pages/RecommendationsPage';
import DeliveryTrackingPage from './pages/DeliveryTrackingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RoleDashboardPage from './pages/RoleDashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import ImpactAnalyticsPage from './pages/ImpactAnalyticsPage';
import './styles/App.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    notificationService
      .getUnreadCount()
      .then((res) => setUnreadCount(res.unreadCount || 0))
      .catch(() => {});

    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.on('notification:new', () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      case 'role-dashboard':
        return <RoleDashboardPage onNavigate={setCurrentPage} />;
      case 'donor-dashboard':
        return <DonorDashboardPage />;
      case 'ngo-browse':
        return <NgoBrowsePage />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'deliveries':
        return <DeliveryTrackingPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'notifications':
        return <NotificationsPage onUnreadChange={setUnreadCount} />;
      case 'impact':
        return <ImpactAnalyticsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      unreadCount={unreadCount}
    >
      {renderPage()}
    </MainLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
