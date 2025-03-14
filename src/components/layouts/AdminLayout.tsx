'use client'

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { withAuth } from '@/lib/auth/withAuth';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileText, 
  Building2, 
  Settings, 
  LogOut,
  Menu,
  X,
  ClipboardList
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutBase({ children }: AdminLayoutProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { href: '/admin/reviews', label: 'Reviews', icon: <FileText className="w-5 h-5 mr-3" /> },
    { href: '/admin/companies', label: 'Companies', icon: <Building2 className="w-5 h-5 mr-3" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5 mr-3" /> },
    { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5 mr-3" /> },
    { href: '/admin/background-check', label: 'Background Check', icon: <ClipboardList className="w-5 h-5 mr-3" /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5 mr-3" /> },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white dark:bg-gray-800 shadow"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/admin" className="flex items-center">
              <span className="text-xl font-bold text-gray-800 dark:text-white">Admin Dashboard</span>
            </Link>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primary-foreground font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-gray-800 shadow z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="lg:hidden">
                {/* Spacer for mobile */}
              </div>
              <div className="flex items-center">
                {/* Add user profile or other header elements here */}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export const AdminLayout = withAuth(AdminLayoutBase);