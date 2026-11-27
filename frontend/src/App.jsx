import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
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
import './styles/App.css';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
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
      default:
        return <HomePage />;
    }
  };

  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
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
