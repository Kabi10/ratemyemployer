'use client';

import { ThemeProvider } from 'next-themes';
import { type ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="theme"
      >
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
