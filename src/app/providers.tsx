'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/Toast';

interface Props {
  children: React.ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
