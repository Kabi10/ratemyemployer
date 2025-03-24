'use client'

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { AuthError } from '@supabase/supabase-js';

import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { createClient } from '@/lib/supabaseClient';

import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { AuthError as CustomAuthError } from '@/types/auth';














export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp, isLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // Password validation function
  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    return null;
  };

  // Enhanced error display component
  const ErrorDisplay = ({ error }: { error: string }) => (
    <Alert variant="destructive" className="mt-4">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  // Loading button component
  const LoadingButton = ({ isLoading, children, ...props }: any) => (
    <Button disabled={isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? `${children}...` : children}
    </Button>
  );

  // Enhanced password input with toggle
  const PasswordInput = () => (
    <div className="relative">
      <Input
        id="password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="pr-10"
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-gray-500" />
        ) : (
          <Eye className="h-4 w-4 text-gray-500" />
        )}
      </button>
    </div>
  );

  const handleForgotPassword = async (e: React.FormEvent) => {
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

      if (error) throw error;
      setResetEmailSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reset email. Please try again.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          return;
        }

        const { data, error } = await signUp(email, password);
        
        console.log('Signup response:', { data, error });
        
        if (error) {
          if (error.message === 'Email address already taken') {
            setError('An account with this email already exists. Please sign in instead.');
            setIsSignUp(false);
            return;
          }
          setError(error.message);
          return;
        }

        if (data?.user && !data.user.email_confirmed_at) {
          setEmailSent(true);
        } else {
          router.push('/');
        }
      } else {
        try {
          await signIn(email, password);
          router.push('/');
        } catch (error) {
          console.error('Sign in error:', error);
          if (error instanceof AuthError || (error as CustomAuthError).message) {
            const authError = error as AuthError | CustomAuthError;
            if (authError.message?.toLowerCase().includes('invalid login credentials')) {
              setError('Invalid email or password. Please try again.');
            } else if (authError.message?.toLowerCase().includes('email not confirmed')) {
              setError('Please confirm your email address before signing in.');
            } else {
              setError(authError.message);
            }
          } else {
            setError('Sign in failed. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error instanceof Error || (error as CustomAuthError).message) {
        setError((error as Error | CustomAuthError).message);
      } else {
        setError('Authentication failed. Please try again.');
      }
    }
  };

  // Add handler for mode switch - only clear password on manual mode switch
  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setPassword(''); // Only clear password on manual mode switch
  };

  if (resetEmailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>We&apos;ve sent a password reset link to <strong>{email}</strong></p>
          <p>Please check your email and click the link to reset your password.</p>
          <p className="text-sm text-muted-foreground">
            Can&apos;t find the email? Check your spam folder or{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => {
                setResetEmailSent(false);
                setIsForgotPassword(false);
              }}
            >
              try again
            </Button>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isForgotPassword) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {error && <ErrorDisplay error={error} />}
            <LoadingButton type="submit" className="w-full" isLoading={isLoading}>
              Send Reset Link
            </LoadingButton>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setIsForgotPassword(false)}
            >
              Back to Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>We&apos;ve sent a confirmation link to <strong>{email}</strong></p>
          <p>Please check your email and click the link to complete your registration.</p>
          <p className="text-sm text-muted-foreground">
            Can&apos;t find the email? Check your spam folder or{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setEmailSent(false)}
            >
              try signing up again
            </Button>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput />
          </div>
          {error && <ErrorDisplay error={error} />}
          <LoadingButton type="submit" className="w-full" isLoading={isLoading}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </LoadingButton>
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="link"
              onClick={handleModeSwitch}
              disabled={isLoading}
            >
              {isSignUp ? 'Already have an account?' : 'Need an account?'}
            </Button>
            {!isSignUp && (
              <Button
                type="button"
                variant="link"
                onClick={() => setIsForgotPassword(true)}
                disabled={isLoading}
              >
                Forgot Password?
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}