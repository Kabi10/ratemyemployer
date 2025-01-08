"use strict";
'use client';
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLayout = void 0;
const withAuth_1 = require("@/lib/auth/withAuth");
const React = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
function BaseAdminLayout({ children }) {
    return (<div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-4">
            <link_1.default href="/admin" className="text-gray-700 hover:text-gray-900 font-medium">
              Dashboard
            </link_1.default>
            <link_1.default href="/admin/companies" className="text-gray-700 hover:text-gray-900 font-medium">
              Companies
            </link_1.default>
            <link_1.default href="/admin/reviews" className="text-gray-700 hover:text-gray-900 font-medium">
              Reviews
            </link_1.default>
            <link_1.default href="/admin/users" className="text-gray-700 hover:text-gray-900 font-medium">
              Users
            </link_1.default>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>);
}
// Protect the admin layout for admin users
exports.AdminLayout = (0, withAuth_1.withAuth)(BaseAdminLayout, { requiredRole: 'admin' });
