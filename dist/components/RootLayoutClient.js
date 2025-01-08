"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Navbar_1 = require("@/components/Navbar");
const Footer_1 = require("@/components/Footer");
const providers_1 = require("@/app/providers");
const ThemeToggle_1 = __importDefault(require("@/components/ThemeToggle"));
const PerformanceMonitor_1 = __importDefault(require("@/components/PerformanceMonitor"));
function RootLayoutClient({ children }) {
    return (<providers_1.Providers>
      <div className="flex flex-col min-h-screen">
        <Navbar_1.Navbar />
        <main className="flex-grow">{children}</main>
        <ThemeToggle_1.default />
        <PerformanceMonitor_1.default />
        <Footer_1.Footer />
      </div>
    </providers_1.Providers>);
}
exports.default = RootLayoutClient;
