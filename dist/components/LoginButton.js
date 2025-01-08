"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginButton = void 0;
const AuthContext_1 = require("@/contexts/AuthContext");
function LoginButton() {
    const { user, isLoading, error, signIn, signOut } = (0, AuthContext_1.useAuth)();
    if (isLoading) {
        return (<button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200" disabled>
        Loading...
      </button>);
    }
    if (error) {
        return (<button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200" onClick={() => window.location.reload()}>
        Error: {error}
      </button>);
    }
    if (user) {
        return (<button onClick={() => signOut()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
        Sign Out
      </button>);
    }
    return (<button onClick={() => signIn('', '')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
      Sign In
    </button>);
}
exports.LoginButton = LoginButton;
