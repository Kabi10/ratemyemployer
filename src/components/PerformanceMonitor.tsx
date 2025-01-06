'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BarChart2 } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number | null;
  loadPercentage: number;
  ttfb: number | null;
  fcp: number | null;
  lcp: number | null;
}

export default function PerformanceMonitor() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: null,
    loadPercentage: 0,
    ttfb: null,
    fcp: null,
    lcp: null,
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'p') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    // Reset metrics on navigation
    setMetrics({
      loadTime: null,
      loadPercentage: 0,
      ttfb: null,
      fcp: null,
      lcp: null,
    });

    const startTime = performance.now();

    // Track Time to First Byte
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            ttfb: navEntry.responseStart - navEntry.requestStart,
          }));
        }
      });
    });
    observer.observe({ entryTypes: ['navigation'] });

    // Track First Contentful Paint
    const fcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({
            ...prev,
            fcp: entry.startTime,
          }));
        }
      });
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Track Largest Contentful Paint
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics(prev => ({
        ...prev,
        lcp: lastEntry.startTime,
      }));
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Simulate loading percentage
    const loadInterval = setInterval(() => {
      setMetrics(prev => {
        if (prev.loadPercentage >= 100) {
          clearInterval(loadInterval);
          return {
            ...prev,
            loadTime: performance.now() - startTime,
            loadPercentage: 100,
          };
        }
        return {
          ...prev,
          loadPercentage: Math.min(prev.loadPercentage + 10, 100),
        };
      });
    }, 100);

    return () => {
      observer.disconnect();
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      clearInterval(loadInterval);
    };
  }, [pathname]);

  const formatTime = (ms: number | null) => {
    if (ms === null) return '...';
    return (ms / 1000).toFixed(2);
  };

  // Always show the toggle button
  const toggleButton = (
    <button
      onClick={() => setIsVisible(prev => !prev)}
      className="fixed bottom-6 right-20 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 z-50 border border-gray-200 dark:border-gray-700"
      title="Toggle Performance Monitor (Alt+P)"
    >
      <BarChart2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>
  );

  if (!isVisible) {
    return toggleButton;
  }

  return (
    <>
      {toggleButton}
      <div className="fixed bottom-20 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-sm border border-gray-200 dark:border-gray-700 z-50">
        <div className="flex flex-col items-end space-y-1">
          <div className="text-gray-600 dark:text-gray-300">Load: {metrics.loadPercentage}%</div>
          <div className="text-gray-600 dark:text-gray-300">
            Time: {formatTime(metrics.loadTime)}s
          </div>
          <div className="text-gray-600 dark:text-gray-300">TTFB: {formatTime(metrics.ttfb)}s</div>
          <div className="text-gray-600 dark:text-gray-300">FCP: {formatTime(metrics.fcp)}s</div>
          <div className="text-gray-600 dark:text-gray-300">LCP: {formatTime(metrics.lcp)}s</div>
        </div>
      </div>
    </>
  );
}
