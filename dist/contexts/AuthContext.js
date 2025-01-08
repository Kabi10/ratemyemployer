"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = exports.AuthProvider = void 0;
const react_1 = require("react");
const supabaseClient_1 = require("@/lib/supabaseClient");
const AuthContext = (0, react_1.createContext)(undefined);
function AuthProvider({ children }) {
    var _a;
    const [user, setUser] = (0, react_1.useState)(null);
    const [session, setSession] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const initializeAuth = async () => {
            var _a;
            const supabase = (0, supabaseClient_1.createClient)();
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
                setSession(session);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Error initializing auth');
            }
            finally {
                setIsLoading(false);
            }
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                var _a;
                setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
                setSession(session);
                setIsLoading(false);
            });
            return () => subscription.unsubscribe();
        };
        initializeAuth();
    }, []);
    const isAdmin = ((_a = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _a === void 0 ? void 0 : _a.role) === 'admin';
    const value = {
        user,
        session,
        isLoading,
        error,
        isAdmin,
        signIn: async (email, password) => {
            const supabase = (0, supabaseClient_1.createClient)();
            setIsLoading(true);
            setError(null);
            try {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error)
                    throw error;
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Sign in failed');
                throw err;
            }
            finally {
                setIsLoading(false);
            }
        },
        signUp: async (email, password) => {
            var _a;
            const supabase = (0, supabaseClient_1.createClient)();
            setIsLoading(true);
            setError(null);
            try {
                console.log('Starting signup in AuthContext...');
                // First check if user exists using sign in
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password: 'dummy-check-password'
                });
                // If we get an "Invalid credentials" error, it means the email exists
                // (because the password is wrong but the email exists)
                if ((_a = signInError === null || signInError === void 0 ? void 0 : signInError.message) === null || _a === void 0 ? void 0 : _a.includes('Invalid login credentials')) {
                    console.log('User exists check:', signInError);
                    const error = new Error('Email address already taken');
                    setError(error.message);
                    return { error };
                }
                // If we get here, try to sign up
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`
                    }
                });
                if (error) {
                    console.error('Signup error:', error);
                    setError(error.message);
                    return { error };
                }
                if (!(data === null || data === void 0 ? void 0 : data.user)) {
                    console.error('No user data received');
                    const error = new Error('Failed to create account');
                    setError(error.message);
                    return { error };
                }
                return { data };
            }
            catch (err) {
                console.error('Signup error:', err);
                setError(err instanceof Error ? err.message : 'Sign up failed');
                throw err;
            }
            finally {
                setIsLoading(false);
            }
        },
        signOut: async () => {
            const supabase = (0, supabaseClient_1.createClient)();
            setIsLoading(true);
            setError(null);
            try {
                const { error } = await supabase.auth.signOut();
                if (error)
                    throw error;
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Sign out failed');
                throw err;
            }
            finally {
                setIsLoading(false);
            }
        },
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
exports.AuthProvider = AuthProvider;
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
