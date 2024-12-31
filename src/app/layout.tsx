import { Inter } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import RootLayoutClient from '@/components/RootLayoutClient';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rate My Employer',
  description: 'A platform for reviewing and rating employers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <RootLayoutClient>{children}</RootLayoutClient>
        </ErrorBoundary>
      </body>
    </html>
  );
}
