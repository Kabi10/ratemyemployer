"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const AuthContext_1 = require("@/contexts/AuthContext");
const navigation_1 = require("next/navigation");
const supabaseClient_1 = require("@/lib/supabaseClient");
function Auth() {
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [isSignUp, setIsSignUp] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const [emailSent, setEmailSent] = (0, react_1.useState)(false);
    const [isForgotPassword, setIsForgotPassword] = (0, react_1.useState)(false);
    const [resetEmailSent, setResetEmailSent] = (0, react_1.useState)(false);
    const { signIn, signUp, isLoading } = (0, AuthContext_1.useAuth)();
    const router = (0, navigation_1.useRouter)();
    const supabase = (0, supabaseClient_1.createClient)();
    // Password validation function
    const validatePassword = (password) => {
        if (password.length < 8)
            return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password))
            return 'Password must contain an uppercase letter';
        if (!/[a-z]/.test(password))
            return 'Password must contain a lowercase letter';
        if (!/[0-9]/.test(password))
            return 'Password must contain a number';
        return null;
    };
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError(null);
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error)
                throw error;
            setResetEmailSent(true);
        }
        catch (error) {
            console.error('Reset password error:', error);
            setError(error instanceof Error ? error.message : 'Failed to send reset email. Please try again.');
        }
    };
    const handleAuth = async (e) => {
        var _a, _b;
        e.preventDefault();
        setError(null);
        try {
            if (isSignUp) {
                const passwordError = validatePassword(password);
                if (passwordError) {
                    setError(passwordError);
                    return;
                }
                // Try to sign up
                const { data, error } = await signUp(email, password);
                console.log('Signup response:', { data, error }); // Debug log
                if (error) {
                    // Handle existing user case
                    if (error.message === 'Email address already taken') {
                        setError('An account with this email already exists. Please sign in instead.');
                        setIsSignUp(false); // Switch to sign in mode but keep the password
                        return;
                    }
                    setError(error.message);
                    return;
                }
                // Only show email confirmation for new signups
                if ((data === null || data === void 0 ? void 0 : data.user) && !data.user.email_confirmed_at) {
                    setEmailSent(true);
                }
                else {
                    // If email is already confirmed (shouldn't happen in normal flow)
                    router.push('/account');
                }
            }
            else {
                try {
                    await signIn(email, password);
                    router.push('/account');
                }
                catch (error) {
                    console.error('Sign in error:', error);
                    if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('invalid login credentials')) {
                        setError('Invalid email or password. Please try again.');
                    }
                    else if ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('email not confirmed')) {
                        setError('Please confirm your email address before signing in.');
                    }
                    else {
                        setError(error instanceof Error ? error.message : 'Sign in failed. Please try again.');
                    }
                }
            }
        }
        catch (error) {
            console.error('Auth error:', error);
            setError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
        }
    };
    // Add handler for mode switch - only clear password on manual mode switch
    const handleModeSwitch = () => {
        setIsSignUp(!isSignUp);
        setError(null);
        setPassword(''); // Only clear password on manual mode switch
    };
    if (resetEmailSent) {
        return (<card_1.Card className="w-full max-w-md mx-auto">
        <card_1.CardHeader>
          <card_1.CardTitle>Check Your Email</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <p>We&apos;ve sent a password reset link to <strong>{email}</strong></p>
          <p>Please check your email and click the link to reset your password.</p>
          <p className="text-sm text-muted-foreground">
            Can&apos;t find the email? Check your spam folder or{' '}
            <button_1.Button variant="link" className="p-0 h-auto" onClick={() => {
                setResetEmailSent(false);
                setIsForgotPassword(false);
            }}>
              try again
            </button_1.Button>
          </p>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (isForgotPassword) {
        return (<card_1.Card className="w-full max-w-md mx-auto">
        <card_1.CardHeader>
          <card_1.CardTitle>Reset Password</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="email">Email</label_1.Label>
              <input_1.Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button_1.Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button_1.Button>
            <button_1.Button type="button" variant="link" className="w-full" onClick={() => setIsForgotPassword(false)}>
              Back to Sign In
            </button_1.Button>
          </form>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (emailSent) {
        return (<card_1.Card className="w-full max-w-md mx-auto">
        <card_1.CardHeader>
          <card_1.CardTitle>Check Your Email</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <p>We&apos;ve sent a confirmation link to <strong>{email}</strong></p>
          <p>Please check your email and click the link to complete your registration.</p>
          <p className="text-sm text-muted-foreground">
            Can&apos;t find the email? Check your spam folder or{' '}
            <button_1.Button variant="link" className="p-0 h-auto" onClick={() => setEmailSent(false)}>
              try signing up again
            </button_1.Button>
          </p>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className="max-w-md mx-auto mt-8">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-center">{isSignUp ? 'Sign Up' : 'Sign In'}</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label_1.Label htmlFor="email">Email</label_1.Label>
            <input_1.Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label_1.Label htmlFor="password">Password</label_1.Label>
              {!isSignUp && (<button_1.Button type="button" variant="link" className="px-0 h-auto text-sm" onClick={() => setIsForgotPassword(true)}>
                  Forgot password?
                </button_1.Button>)}
            </div>
            <div className="relative">
              <input_1.Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => {
            setPassword(e.target.value);
            if (isSignUp) {
                const validationError = validatePassword(e.target.value);
                setError(validationError || null);
            }
        }} required autoComplete={isSignUp ? 'new-password' : 'current-password'} autoFocus={!isSignUp && email !== ''}/>
              <button_1.Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <lucide_react_1.EyeOff className="h-4 w-4"/> : <lucide_react_1.Eye className="h-4 w-4"/>}
              </button_1.Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <button_1.Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button_1.Button>
          <button_1.Button type="button" variant="link" className="w-full" onClick={handleModeSwitch}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button_1.Button>
        </form>
      </card_1.CardContent>
    </card_1.Card>);
}
exports.default = Auth;
