'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function AuthButtons() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div>
      {!user ? (
        <Button
          onClick={handleSignIn}
          variant="default"
        >
          Sign In
        </Button>
      ) : (
        <Button
          onClick={handleSignOut}
          variant="outline"
        >
          Sign Out
        </Button>
      )}
    </div>
  );
}
