'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Providers } from '@/app/providers';
import ThemeToggle from '@/components/ThemeToggle';
import PerformanceMonitor from '@/components/PerformanceMonitor';

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
