'use client'

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { withAuth } from '@/lib/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  Settings, 
  BarChart3, 
  Shield, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutBase({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { signOut, getUserRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userRole = getUserRole();
  
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || isAdmin;

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, current: pathname === '/admin', visible: true },
    { name: 'Reviews', href: '/admin/reviews', icon: FileText, current: pathname === '/admin/reviews', visible: true },
    { name: 'Companies', href: '/admin/companies', icon: Building2, current: pathname === '/admin/companies', visible: true },
    { name: 'Users', href: '/admin/users', icon: Users, current: pathname === '/admin/users', visible: isAdmin },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: pathname === '/admin/analytics', visible: isAdmin },
    { name: 'Background Checks', href: '/admin/background-check', icon: Shield, current: pathname === '/admin/background-check', visible: isAdmin },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: pathname === '/admin/settings', visible: isAdmin },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar}
          className="bg-white dark:bg-gray-800 shadow-md"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 h-16 border-b dark:border-gray-700">
            <Link href="/admin" className="text-xl font-bold text-gray-800 dark:text-white">
              Admin Panel
            </Link>
            <div className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navigation.filter(item => item.visible).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${item.current 
                      ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          
          <div className="p-4 border-t dark:border-gray-700">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </div>
            <Separator className="my-2" />
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 dark:text-red-400"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Export with auth protection, requiring at least moderator role
export const AdminLayout = withAuth(AdminLayoutBase, { requiredRole: 'moderator' });