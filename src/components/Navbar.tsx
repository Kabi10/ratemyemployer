'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronDown } from 'lucide-react';
import { UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc('get_user_role', {
          user_id: user.id,
        });

        if (!error && data === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            RateMyEmployer
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/companies"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              Companies
            </Link>
            <Link
              href="/reviews"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              Reviews
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.email}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowDropdown(false)}
                        >
                          Admin Dashboard
                        </Link>
                        <Link
                          href="/admin/analytics"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowDropdown(false)}
                        >
                          Analytics
                        </Link>
                      </>
                    )}
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/account/reviews"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Reviews
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        signOut();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <Link
            href="/companies"
            className="block py-2 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Companies
          </Link>
          <Link
            href="/reviews"
            className="block py-2 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Reviews
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="block py-2 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/account"
                className="block py-2 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Profile
              </Link>
              <button
                onClick={signOut}
                className="block w-full text-left py-2 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="block py-2 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
