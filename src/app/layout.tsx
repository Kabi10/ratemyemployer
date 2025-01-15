import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { FirebaseProvider } from '@/contexts/FirebaseContext';

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
          <Navbar />
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}
