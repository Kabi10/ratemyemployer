"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockSupabaseClient = void 0;
const vitest_1 = require("vitest");
// Create a simple mock response
const mockResponse = {
    data: null,
    error: null,
};
// Create a simple chainable mock
const createChainableMock = () => {
    const chainable = {
        select: vitest_1.vi.fn(() => chainable),
        insert: vitest_1.vi.fn(() => chainable),
        update: vitest_1.vi.fn(() => chainable),
        delete: vitest_1.vi.fn(() => chainable),
        eq: vitest_1.vi.fn(() => chainable),
        ilike: vitest_1.vi.fn(() => chainable),
        gte: vitest_1.vi.fn(() => chainable),
        lte: vitest_1.vi.fn(() => chainable),
        single: vitest_1.vi.fn(() => chainable),
        order: vitest_1.vi.fn(() => chainable),
        limit: vitest_1.vi.fn(() => chainable),
        range: vitest_1.vi.fn(() => chainable),
        then: vitest_1.vi.fn((callback) => Promise.resolve(callback(mockResponse))),
    };
    return chainable;
};
// Create mock Supabase client
exports.mockSupabaseClient = {
    from: vitest_1.vi.fn((table) => createChainableMock()),
    auth: {
        signInWithPassword: vitest_1.vi.fn(() => Promise.resolve(mockResponse)),
        signUp: vitest_1.vi.fn(() => Promise.resolve(mockResponse)),
        signOut: vitest_1.vi.fn(() => Promise.resolve(mockResponse)),
        getSession: vitest_1.vi.fn(() => Promise.resolve(mockResponse)),
        onAuthStateChange: vitest_1.vi.fn(() => ({ unsubscribe: vitest_1.vi.fn() })),
    },
};
