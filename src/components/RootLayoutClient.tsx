'use client'

import { Providers } from '@/app/providers';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import PerformanceMonitor from '@/components/PerformanceMonitor';

import ThemeToggle from '@/components/ThemeToggle';







export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <ThemeToggle />
        <PerformanceMonitor />
        <Footer />
      </div>
    </Providers>
  );
}