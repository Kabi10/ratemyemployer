"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuth = void 0;
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const AuthContext_1 = require("@/contexts/AuthContext");
const LoadingSpinner_1 = __importDefault(require("@/components/ui/LoadingSpinner"));
function withAuth(WrappedComponent, { requiredRole, redirectTo = '/auth/login' } = {}) {
    return function WithAuthComponent(props) {
        const { user, isLoading } = (0, AuthContext_1.useAuth)();
        const router = (0, navigation_1.useRouter)();
        const roleRef = (0, react_1.useRef)(requiredRole);
        (0, react_1.useEffect)(() => {
            if (!isLoading && !user) {
                router.push(redirectTo);
            }
            else if (roleRef.current && (user === null || user === void 0 ? void 0 : user.role) !== roleRef.current) {
                router.push('/unauthorized');
            }
        }, [isLoading, user, router, redirectTo]);
        if (isLoading) {
            return (<div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner_1.default size="lg"/>
        </div>);
        }
        if (!user) {
            return null;
        }
        if (requiredRole && user.role !== requiredRole) {
            return null;
        }
        return <WrappedComponent {...props}/>;
    };
}
exports.withAuth = withAuth;
