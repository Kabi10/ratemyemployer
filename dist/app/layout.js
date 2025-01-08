"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
const google_1 = require("next/font/google");
const ErrorBoundary_1 = require("@/components/ErrorBoundary");
const RootLayoutClient_1 = __importDefault(require("@/components/RootLayoutClient"));
require("./globals.css");
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: 'Rate My Employer',
    description: 'A platform for reviewing and rating employers',
};
function RootLayout({ children }) {
    return (<html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary_1.ErrorBoundary>
          <RootLayoutClient_1.default>{children}</RootLayoutClient_1.default>
        </ErrorBoundary_1.ErrorBoundary>
      </body>
    </html>);
}
exports.default = RootLayout;
