"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@/lib/utils");
function LoadingSpinner({ className, size = 'md' }) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };
    return (<div className={(0, utils_1.cn)('animate-spin rounded-full border-t-transparent border-primary', sizeClasses[size], className)}/>);
}
exports.default = LoadingSpinner;
