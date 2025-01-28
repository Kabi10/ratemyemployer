'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Menu, User, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
            RME
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/companies"
              className="text-lg text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors"
            >
              Companies
            </Link>
            <Link
              href="/reviews"
              className="text-lg text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors"
            >
              Reviews
            </Link>
            <Link 
              href="/shame" 
              className="text-lg text-gray-700 hover:text-red-600 dark:text-gray-200 dark:hover:text-red-400 transition-colors"
            >
              Wall of Shame
            </Link>
            <Link 
              href="/fame" 
              className="text-lg text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors"
            >
              Wall of Fame
            </Link>
            <Link
              href="/background-check"
              className="text-lg text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors"
            >
              Background Check
            </Link>
            {isLoading ? (
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name || 'User'}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                  )}
                  <span className="hidden sm:inline text-lg text-gray-700 dark:text-gray-200">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-800">
                    <Link
                      href="/account"
                      className="block px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Account
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-5 py-3 text-base text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                         text-white px-6 py-2.5 rounded-lg transition-all duration-200 
                         text-lg font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] 
                         active:scale-[0.98] flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
          <button 
            className="md:hidden p-2 text-gray-700 dark:text-gray-200" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/companies"
            className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Companies
          </Link>
          <Link
            href="/reviews"
            className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Reviews
          </Link>
          <Link
            href="/shame"
            className="block py-3 px-6 text-lg text-gray-700 hover:text-red-600 dark:text-gray-200 dark:hover:text-red-400"
          >
            Wall of Shame
          </Link>
          <Link
            href="/fame"
            className="block py-3 px-6 text-lg text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
          >
            Wall of Fame
          </Link>
          <Link
            href="/background-check"
            className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Background Check
          </Link>
          {user ? (
            <>
              <Link
                href="/account"
                className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                My Account
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left py-3 px-6 text-lg text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="block mx-6 my-4 py-3 text-center bg-gradient-to-r from-blue-600 to-indigo-600 
                       hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-colors 
                       text-lg font-medium shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}