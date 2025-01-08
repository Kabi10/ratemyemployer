"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const utils_1 = require("@/lib/utils");
function LoadingSpinner(_a) {
    var { size = 'md', className, role = 'status' } = _a, props = __rest(_a, ["size", "className", "role"]);
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };
    return (<div role={role} className={(0, utils_1.cn)('animate-spin rounded-full border-2 border-current border-t-transparent', sizeClasses[size] || sizeClasses.md, className)} {...props}/>);
}
exports.LoadingSpinner = LoadingSpinner;
