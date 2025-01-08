"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
const react_1 = __importDefault(require("react"));
const button_1 = require("./ui/button");
class ErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    render() {
        var _a;
        if (this.state.hasError) {
            return (this.props.fallback || (<div className="min-h-[400px] flex flex-col items-center justify-center p-4">
            <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {((_a = this.state.error) === null || _a === void 0 ? void 0 : _a.message) || 'An unexpected error occurred'}
            </p>
            <button_1.Button onClick={() => {
                    this.setState({ hasError: false });
                    window.location.reload();
                }}>
              Try again
            </button_1.Button>
          </div>));
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
