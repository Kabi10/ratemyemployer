"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
};
function LoadingSpinner({ size = 'md', className, fullScreen = false, }) {
    const spinner = <lucide_react_1.Loader2 className={(0, utils_1.cn)('animate-spin', sizeClasses[size], className)}/>;
    if (fullScreen) {
        return (<div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>);
    }
    return spinner;
}
exports.LoadingSpinner = LoadingSpinner;
