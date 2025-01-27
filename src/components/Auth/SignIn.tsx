import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { syncUserToSupabase } from '@/lib/auth/sync';
import { useRouter } from 'next/navigation';
import { toast } from "@/components/ui/use-toast";
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export const SignInButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignIn = async () => {
    setIsLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const { user } = result;
      
      if (!user) throw new Error('No user returned from sign in');
      
      await syncUserToSupabase();
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign-in error:', error);
      toast({
        title: "Sign-in Failed",
        description: error instanceof Error ? error.message : 'Could not authenticate',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSignIn} disabled={isLoading}>
      {isLoading ? <LoadingSpinner /> : 'Sign in with Google'}
    </Button>
  );
}; 