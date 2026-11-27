import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export function MainLayout({ children, currentPage, onNavigate }) {
  return (
    <div className="layout">
      <Header currentPage={currentPage} onNavigate={onNavigate} />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
