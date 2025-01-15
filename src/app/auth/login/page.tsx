'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { User, Lock, Mail, Github, Twitter } from 'lucide-react';
import { signInWithGithub, signInWithTwitter, signInWithEmail, signUpWithEmail, resetPassword } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get('signup') === 'true';
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSuccess = (user: any) => {
    console.log('Signed in user:', user);
    router.push('/');
  };

  const handleError = (error: string) => {
    setError(error);
    setTimeout(() => setError(null), 5000);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      
      if (result.success && result.user) {
        handleSuccess(result.user);
      } else {
        handleError(result.error || `Failed to ${isSignUp ? 'create account' : 'sign in'}`);
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : `Failed to ${isSignUp ? 'create account' : 'sign in'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        setResetSuccess(true);
        setTimeout(() => {
          setShowResetForm(false);
          setResetSuccess(false);
          setResetEmail('');
        }, 3000);
      } else {
        handleError(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGithub();
      if (result.success && result.user) {
        handleSuccess(result.user);
      } else {
        handleError(result.error || 'Failed to sign in with GitHub');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to sign in with GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithTwitter();
      if (result.success && result.user) {
        handleSuccess(result.user);
      } else {
        handleError(result.error || 'Failed to sign in with Twitter');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to sign in with Twitter');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Glass panel */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          <AnimatePresence mode="wait">
            {showResetForm ? (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                  <p className="text-gray-300">Enter your email to receive reset instructions</p>
                </div>

                {resetSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-sm text-center"
                  >
                    Reset instructions sent! Check your email.
                  </motion.div>
                ) : (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl
                                text-white placeholder-gray-400 focus:outline-none focus:ring-2
                                focus:ring-blue-500/50 transition-all"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600
                              hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl
                              font-medium transition-all duration-200 transform hover:scale-[1.02]
                              active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        'Send Reset Instructions'
                      )}
                    </button>
                  </form>
                )}

                <button
                  onClick={() => setShowResetForm(false)}
                  className="w-full text-center text-blue-400 hover:text-blue-300 transition-colors py-2"
                >
                  Back to Sign In
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h1>
                  <p className="text-gray-300">
                    {isSignUp 
                      ? 'Join our community of workplace transparency'
                      : 'Continue your journey of workplace discovery'}
                  </p>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Email/Password Form */}
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 
                                     group-hover:text-blue-400 transition-colors" />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl
                                   text-white placeholder-gray-400 focus:outline-none focus:ring-2
                                   focus:ring-blue-500/50 transition-all group-hover:border-blue-400/50"
                          required
                        />
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 
                                     group-hover:text-blue-400 transition-colors" />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl
                                   text-white placeholder-gray-400 focus:outline-none focus:ring-2
                                   focus:ring-blue-500/50 transition-all group-hover:border-blue-400/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowResetForm(true)}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600
                              hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl
                              font-medium transition-all duration-200 transform hover:scale-[1.02]
                              active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed
                              disabled:transform-none shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        'Sign In with Email'
                      )}
                    </button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <GoogleSignInButton
                      onSuccess={handleSuccess}
                      onError={handleError}
                      className="hover:scale-[1.02] active:scale-[0.98]"
                    />

                    <button
                      onClick={handleGithubSignIn}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 
                              bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl
                              transition-all duration-200 transform hover:scale-[1.02] 
                              active:scale-[0.98] shadow-md hover:shadow-lg"
                    >
                      <Github className="w-5 h-5" />
                      <span>Continue with GitHub</span>
                    </button>

                    <button
                      onClick={handleTwitterSignIn}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 
                              bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-medium rounded-xl
                              transition-all duration-200 transform hover:scale-[1.02] 
                              active:scale-[0.98] shadow-md hover:shadow-lg"
                    >
                      <Twitter className="w-5 h-5" />
                      <span>Continue with Twitter</span>
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-gray-400">
                        {isSignUp ? 'Already have an account?' : 'New to RateMyEmployer?'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/auth/login?signup=${!isSignUp}`)}
                    className="w-full text-center text-blue-400 hover:text-blue-300 transition-colors py-2"
                  >
                    {isSignUp ? 'Sign in instead' : 'Create an account'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center text-gray-400 text-sm mt-8 px-4"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
          We'll handle your data with care.
        </motion.p>
      </motion.div>
    </div>
  );
}
