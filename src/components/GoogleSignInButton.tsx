import Image from 'next/image';
import { signInWithGoogle } from '@/lib/firebase';
import { useState } from 'react';

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function GoogleSignInButton({ onSuccess, onError, className = '' }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithGoogle();
      
      if (result.success && result.user) {
        onSuccess?.(result.user);
      } else {
        onError?.(result.error || 'Failed to sign in with Google');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 px-6 py-3 
                 bg-white hover:bg-gray-50 active:bg-gray-100 
                 text-gray-800 font-medium rounded-xl
                 border border-gray-300 shadow-sm
                 transition-all duration-200 relative
                 disabled:opacity-70 disabled:cursor-not-allowed
                 ${className}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Image
          src="/google-logo.svg"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      )}
      <span className="text-base">Continue with Google</span>
    </button>
  );
} 