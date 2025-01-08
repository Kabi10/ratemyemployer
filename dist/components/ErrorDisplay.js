"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorDisplay = void 0;
const utils_1 = require("@/lib/utils");
function ErrorDisplay({ message, className }) {
    return (<div className={(0, utils_1.cn)("max-w-4xl mx-auto p-6", className)}>
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700 dark:text-red-200">{message}</p>
      </div>
    </div>);
}
exports.ErrorDisplay = ErrorDisplay;
