"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navbar = void 0;
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const react_1 = require("react");
const AuthContext_1 = require("@/contexts/AuthContext");
function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = (0, react_1.useState)(false);
    const { user, signOut, isAdmin } = (0, AuthContext_1.useAuth)();
    const [showDropdown, setShowDropdown] = (0, react_1.useState)(false);
    return (<nav className="bg-white shadow-md dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <link_1.default href="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
            RME
          </link_1.default>
          <div className="hidden md:flex items-center space-x-8">
            <link_1.default href="/companies" className="text-lg text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors">
              Companies
            </link_1.default>
            <link_1.default href="/reviews" className="text-lg text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors">
              Reviews
            </link_1.default>
            {user ? (<div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 px-5 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200">
                  <lucide_react_1.User className="w-6 h-6"/>
                  <span className="hidden sm:inline text-lg">{user.email}</span>
                  <lucide_react_1.ChevronDown className="w-5 h-5"/>
                </button>

                {showDropdown && (<div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-800">
                    {isAdmin && (<>
                        <link_1.default href="/admin" className="block px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowDropdown(false)}>
                          Admin Dashboard
                        </link_1.default>
                        <link_1.default href="/admin/analytics" className="block px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowDropdown(false)}>
                          Analytics
                        </link_1.default>
                      </>)}
                    <link_1.default href="/account" className="block px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowDropdown(false)}>
                      My Account
                    </link_1.default>
                    <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                    <button onClick={() => {
                    signOut();
                    setShowDropdown(false);
                }} className="block w-full text-left px-5 py-3 text-base text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                      Sign Out
                    </button>
                  </div>)}
              </div>) : (<div className="flex gap-4">
                <link_1.default href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-6 py-2.5 rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:border-blue-700 dark:hover:border-blue-300 transition-colors text-lg font-medium">
                  Sign In
                </link_1.default>
                <link_1.default href="/auth/login?signup=true" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition-colors text-lg font-medium">
                  Sign Up
                </link_1.default>
              </div>)}
          </div>
          <button className="md:hidden p-2 text-gray-700 dark:text-gray-200" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <lucide_react_1.X className="h-7 w-7"/> : <lucide_react_1.Menu className="h-7 w-7"/>}
          </button>
        </div>
      </div>
      {isMenuOpen && (<div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <link_1.default href="/companies" className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            Companies
          </link_1.default>
          <link_1.default href="/reviews" className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            Reviews
          </link_1.default>
          {user ? (<>
              {isAdmin && (<link_1.default href="/admin" className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Admin Dashboard
                </link_1.default>)}
              <link_1.default href="/account" className="block py-3 px-6 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                My Account
              </link_1.default>
              <button onClick={signOut} className="block w-full text-left py-3 px-6 text-lg text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                Sign Out
              </button>
            </>) : (<div className="p-6 space-y-3">
              <link_1.default href="/auth/login" className="block text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-6 py-3 rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:border-blue-700 dark:hover:border-blue-300 transition-colors text-lg font-medium">
                Sign In
              </link_1.default>
              <link_1.default href="/auth/login?signup=true" className="block text-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors text-lg font-medium">
                Sign Up
              </link_1.default>
            </div>)}
        </div>)}
    </nav>);
}
exports.Navbar = Navbar;
