"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = void 0;
const next_themes_1 = require("next-themes");
const AuthContext_1 = require("@/contexts/AuthContext");
const Toast_1 = require("@/components/Toast");
function Providers({ children }) {
    return (<AuthContext_1.AuthProvider>
      <next_themes_1.ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Toast_1.ToastProvider>
          {children}
        </Toast_1.ToastProvider>
      </next_themes_1.ThemeProvider>
    </AuthContext_1.AuthProvider>);
}
exports.Providers = Providers;
