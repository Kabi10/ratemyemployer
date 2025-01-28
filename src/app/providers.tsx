'use client'

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}