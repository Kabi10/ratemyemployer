'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
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
        if (data?.user && !data.user.email_confirmed_at) {
          setEmailSent(true);
        } else {
          // If email is already confirmed (shouldn't happen in normal flow)
          router.push('/account');
        }
      } else {
        try {
          await signIn(email, password);
          router.push('/account');
        } catch (error: any) {
          console.error('Sign in error:', error);
          if (error?.message?.toLowerCase().includes('invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else if (error?.message?.toLowerCase().includes('email not confirmed')) {
            setError('Please confirm your email address before signing in.');
          } else {
            setError(error instanceof Error ? error.message : 'Sign in failed. Please try again.');
          }
        }
      }
    } catch (error) {
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

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>We've sent a confirmation link to <strong>{email}</strong></p>
          <p>Please check your email and click the link to complete your registration.</p>
          <p className="text-sm text-muted-foreground">
            Can't find the email? Check your spam folder or{' '}
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
            <Label htmlFor="password">Password</Label>
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
                // Auto focus on password field when switching to sign in mode
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