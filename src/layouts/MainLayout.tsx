import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ErrorDisplay from '@/components/ErrorDisplay';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<ErrorDisplay message="Layout Error" />}>
      <div className="layout">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
