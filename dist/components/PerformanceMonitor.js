"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
function PerformanceMonitor() {
    const pathname = (0, navigation_1.usePathname)();
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const [metrics, setMetrics] = (0, react_1.useState)({
        loadTime: null,
        loadPercentage: 0,
        ttfb: null,
        fcp: null,
        lcp: null,
    });
    (0, react_1.useEffect)(() => {
        const handleKeyPress = (event) => {
            if (event.altKey && event.key.toLowerCase() === 'p') {
                setIsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);
    (0, react_1.useEffect)(() => {
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
                    const navEntry = entry;
                    setMetrics(prev => (Object.assign(Object.assign({}, prev), { ttfb: navEntry.responseStart - navEntry.requestStart })));
                }
            });
        });
        observer.observe({ entryTypes: ['navigation'] });
        // Track First Contentful Paint
        const fcpObserver = new PerformanceObserver(list => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                    setMetrics(prev => (Object.assign(Object.assign({}, prev), { fcp: entry.startTime })));
                }
            });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        // Track Largest Contentful Paint
        const lcpObserver = new PerformanceObserver(list => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            setMetrics(prev => (Object.assign(Object.assign({}, prev), { lcp: lastEntry.startTime })));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        // Simulate loading percentage
        const loadInterval = setInterval(() => {
            setMetrics(prev => {
                if (prev.loadPercentage >= 100) {
                    clearInterval(loadInterval);
                    return Object.assign(Object.assign({}, prev), { loadTime: performance.now() - startTime, loadPercentage: 100 });
                }
                return Object.assign(Object.assign({}, prev), { loadPercentage: Math.min(prev.loadPercentage + 10, 100) });
            });
        }, 100);
        return () => {
            observer.disconnect();
            fcpObserver.disconnect();
            lcpObserver.disconnect();
            clearInterval(loadInterval);
        };
    }, [pathname]);
    const formatTime = (ms) => {
        if (ms === null)
            return '...';
        return (ms / 1000).toFixed(2);
    };
    // Always show the toggle button
    const toggleButton = (<button onClick={() => setIsVisible(prev => !prev)} className="fixed bottom-6 right-20 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 z-50 border border-gray-200 dark:border-gray-700" title="Toggle Performance Monitor (Alt+P)">
      <lucide_react_1.BarChart2 className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
    </button>);
    if (!isVisible) {
        return toggleButton;
    }
    return (<>
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
    </>);
}
exports.default = PerformanceMonitor;
