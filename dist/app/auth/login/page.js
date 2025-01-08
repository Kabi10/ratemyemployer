"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = __importDefault(require("@/components/Auth"));
function LoginPage() {
    return (<div className="container mx-auto px-4 py-8">
      <Auth_1.default />
    </div>);
}
exports.default = LoginPage;
