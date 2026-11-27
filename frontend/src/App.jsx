import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DonorDashboardPage from './pages/DonorDashboardPage';
import NgoDashboardPage from './pages/NgoDashboardPage';
import VolunteerDashboardPage from './pages/VolunteerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DonationListingPage from './pages/DonationListingPage';
import DonationDetailsPage from './pages/DonationDetailsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import './styles/App.css';

export function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedDonationId, setSelectedDonationId] = useState('mock-don-101');

  const handleNavigate = (page, donationId = null) => {
    if (donationId) {
      setSelectedDonationId(donationId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'donor-dashboard':
        return <DonorDashboardPage onNavigate={handleNavigate} />;
      case 'ngo-dashboard':
        return <NgoDashboardPage onNavigate={handleNavigate} />;
      case 'volunteer-dashboard':
        return <VolunteerDashboardPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'listings':
        return <DonationListingPage onNavigate={handleNavigate} />;
      case 'details':
        return (
          <DonationDetailsPage
            donationId={selectedDonationId}
            onNavigate={handleNavigate}
          />
        );
      case 'settings':
        return <ProfileSettingsPage />;
      case 'landing':
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider>
      <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
