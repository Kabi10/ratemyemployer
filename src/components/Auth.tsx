'use client'

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { AuthError } from '@supabase/supabase-js';

import { Eye, EyeOff } from 'lucide-react';

import { createClient } from '@/lib/supabaseClient';

import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
          router.push('/account');
        }
      } else {
        try {
          await signIn(email, password);
          router.push('/account');
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
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
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
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              {!isSignUp && (
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-sm"
                  onClick={() => setIsForgotPassword(true)}
                >
                  Forgot password?
                </Button>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (isSignUp) {
                    const validationError = validatePassword(e.target.value);
                    setError(validationError || null);
                  }
                }}
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                autoFocus={!isSignUp && email !== ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={handleModeSwitch}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}