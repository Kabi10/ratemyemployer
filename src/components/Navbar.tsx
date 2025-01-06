'use client';

import { ChevronDown, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white shadow-md dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
            RateMyEmployer
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
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden sm:inline text-lg">{user.email}</span>
                  <ChevronDown className="w-5 h-5" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-800">
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          className="block px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setShowDropdown(false)}
                        >
                          Admin Dashboard
                        </Link>
                        <Link
                          href="/admin/analytics"
                          className="block px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setShowDropdown(false)}
                        >
                          Analytics
                        </Link>
                      </>
                    )}
                    <Link
                      href="/account"
                      className="block px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Account
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                    <button
                      onClick={() => {
                        signOut();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-5 py-3 text-base text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/auth/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-6 py-2.5 rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:border-blue-700 dark:hover:border-blue-300 transition-colors text-lg font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/login?signup=true"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition-colors text-lg font-medium"
                >
                  Sign Up
                </Link>
              </div>
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
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/account"
                className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                My Account
              </Link>
              <button
                onClick={signOut}
                className="block w-full text-left py-3 px-6 text-lg text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="p-6 space-y-3">
              <Link
                href="/auth/login"
                className="block text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-6 py-3 rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:border-blue-700 dark:hover:border-blue-300 transition-colors text-lg font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/login?signup=true"
                className="block text-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors text-lg font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
