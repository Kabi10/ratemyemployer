import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RateMyEmployer - Workplace Reviews & Transparency',
  description: 'Discover honest employee reviews, workplace insights, and company culture. Make informed career decisions with RateMyEmployer.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}