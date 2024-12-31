'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function LoginButton() {
  const { user, loading, error, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg">
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <button
        onClick={signOut}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    );
  }

  return (
    <div>
      <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg">
        Sign In (Coming Soon)
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
