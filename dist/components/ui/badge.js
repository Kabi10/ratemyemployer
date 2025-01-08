"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = void 0;
const utils_1 = require("@/lib/utils");
function Badge({ children, variant = 'default', className }) {
    const variants = {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
        destructive: 'bg-red-500 text-white',
        outline: 'border border-gray-200 text-gray-900 dark:border-gray-700 dark:text-gray-100',
    };
    return (<span className={(0, utils_1.cn)('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors', variants[variant], className)}>
      {children}
    </span>);
}
exports.Badge = Badge;
