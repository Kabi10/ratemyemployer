"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAuthContext = exports.render = exports.AuthContext = void 0;
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const user_event_1 = __importDefault(require("@testing-library/user-event"));
const ThemeProvider_1 = require("@/components/ThemeProvider");
const vitest_1 = require("vitest");
const react_3 = require("react");
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vitest_1.vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vitest_1.vi.fn(), // Deprecated
        removeListener: vitest_1.vi.fn(), // Deprecated
        addEventListener: vitest_1.vi.fn(),
        removeEventListener: vitest_1.vi.fn(),
        dispatchEvent: vitest_1.vi.fn(),
    })),
});
// Create a mock context
exports.AuthContext = (0, react_3.createContext)(undefined);
// Mock auth context value
const mockAuthContext = {
    user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'authenticated',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {
            provider: 'email',
        },
        user_metadata: {},
        identities: [],
        updated_at: new Date().toISOString(),
    },
    session: {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        user: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: 'authenticated',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {
                provider: 'email',
            },
            user_metadata: {},
            identities: [],
            updated_at: new Date().toISOString(),
        },
    },
    isLoading: false,
    error: null,
    isAdmin: false,
    signIn: vitest_1.vi.fn(),
    signUp: vitest_1.vi.fn(),
    signOut: vitest_1.vi.fn(),
};
exports.mockAuthContext = mockAuthContext;
// Custom render function that includes providers
const customRender = (ui, options) => {
    const AllTheProviders = ({ children }) => {
        return (<ThemeProvider_1.ThemeProvider>
        <exports.AuthContext.Provider value={mockAuthContext}>
          {children}
        </exports.AuthContext.Provider>
      </ThemeProvider_1.ThemeProvider>);
    };
    return Object.assign({ user: user_event_1.default.setup() }, (0, react_2.render)(ui, Object.assign({ wrapper: AllTheProviders }, options)));
};
exports.render = customRender;
// Re-export everything
__exportStar(require("@testing-library/react"), exports);
