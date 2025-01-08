"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
const vitest_1 = require("vitest");
// Suppress React warnings
const originalError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' &&
        (args[0].includes('React.createContext') ||
            args[0].includes('Invalid hook call') ||
            args[0].includes('node_modules'))) {
        return;
    }
    originalError.call(console, ...args);
};
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vitest_1.vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vitest_1.vi.fn(),
        removeListener: vitest_1.vi.fn(),
        addEventListener: vitest_1.vi.fn(),
        removeEventListener: vitest_1.vi.fn(),
        dispatchEvent: vitest_1.vi.fn(),
    })),
});
// Mock ResizeObserver
global.ResizeObserver = vitest_1.vi.fn().mockImplementation(() => ({
    observe: vitest_1.vi.fn(),
    unobserve: vitest_1.vi.fn(),
    disconnect: vitest_1.vi.fn(),
}));
// Mock IntersectionObserver
global.IntersectionObserver = vitest_1.vi.fn().mockImplementation(() => ({
    observe: vitest_1.vi.fn(),
    unobserve: vitest_1.vi.fn(),
    disconnect: vitest_1.vi.fn(),
}));
// Clear mocks before each test
(0, vitest_1.beforeEach)(() => {
    vitest_1.vi.clearAllMocks();
});
