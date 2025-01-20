import './globals.css';

import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

import { AuthProvider } from '@/contexts/AuthContext';
import { FirebaseProvider } from '@/contexts/FirebaseContext';

import { Navbar } from '@/components/Navbar';
import { ToastProvider } from '@/components/ui/toast';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RateMyEmployer - Workplace Reviews & Transparency',
  description: 'Discover honest employee reviews, workplace insights, and company culture. Make informed career decisions with RateMyEmployer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              {children}
            </ToastProvider>
          </AuthProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}