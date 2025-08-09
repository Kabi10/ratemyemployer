'use client';

/**
 * Enhanced Navbar Component
 * Modern, responsive navigation with advanced styling and interactions
 */

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Moon,
  Sun
} from 'lucide-react';
import { EnhancedButton } from './enhanced-button';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
}

interface EnhancedNavbarProps {
  brand?: {
    name: string;
    logo?: React.ReactNode;
    href?: string;
  };
  items: NavItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut?: () => void;
  onThemeToggle?: () => void;
  isDark?: boolean;
  className?: string;
  variant?: 'default' | 'glass' | 'solid' | 'minimal';
  sticky?: boolean;
  showSearch?: boolean;
  notifications?: number;
}

const EnhancedNavbar: React.FC<EnhancedNavbarProps> = ({
  brand = { name: 'RME', href: '/' },
  items = [],
  user,
  onSignOut,
  onThemeToggle,
  isDark = false,
  className,
  variant = 'default',
  sticky = true,
  showSearch = false,
  notifications = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const navbarVariants = {
    default: cn(
      'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg',
      'border-b border-gray-200 dark:border-gray-700',
      isScrolled && 'shadow-lg'
    ),
    glass: cn(
      'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
      'border-b border-white/20 dark:border-gray-700/50',
      'shadow-lg shadow-black/5'
    ),
    solid: cn(
      'bg-white dark:bg-gray-900',
      'border-b border-gray-200 dark:border-gray-700',
      'shadow-sm'
    ),
    minimal: cn(
      'bg-transparent',
      isScrolled && 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg'
    ),
  };

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href) || false;
  };

  const NavLink: React.FC<{ item: NavItem; mobile?: boolean }> = ({ item, mobile = false }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isActiveLink(item.href);
    const isDropdownOpen = activeDropdown === item.label;

    const linkClasses = cn(
      'relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
      mobile ? 'w-full text-left' : '',
      isActive 
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800',
      hasChildren && 'cursor-pointer'
    );

    if (hasChildren) {
      return (
        <div className="relative">
          <button
            className={linkClasses}
            onClick={() => setActiveDropdown(isDropdownOpen ? null : item.label)}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
            <ChevronDown 
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isDropdownOpen && 'rotate-180'
              )} 
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'absolute top-full left-0 mt-2 w-48 py-2',
                  'bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
                  'z-50'
                )}
              >
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 text-sm transition-colors',
                      isActiveLink(child.href)
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {child.icon && <span className="flex-shrink-0">{child.icon}</span>}
                    <span>{child.label}</span>
                    {child.badge && (
                      <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {child.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link href={item.href} className={linkClasses}>
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
            {item.badge}
          </span>
        )}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <nav 
      className={cn(
        'w-full transition-all duration-300 z-50',
        sticky && 'sticky top-0',
        navbarVariants[variant],
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link 
            href={brand.href || '/'}
            className="flex items-center space-x-3 text-xl font-bold"
          >
            {brand.logo && <span className="flex-shrink-0">{brand.logo}</span>}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {brand.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            {showSearch && (
              <EnhancedButton variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </EnhancedButton>
            )}

            {/* Notifications */}
            {notifications > 0 && (
              <EnhancedButton variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications > 99 ? '99+' : notifications}
                </span>
              </EnhancedButton>
            )}

            {/* Theme Toggle */}
            {onThemeToggle && (
              <EnhancedButton variant="ghost" size="icon" onClick={onThemeToggle}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </EnhancedButton>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <EnhancedButton
                  variant="ghost"
                  className="flex items-center space-x-2"
                  onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </EnhancedButton>

                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      
                      <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      
                      {onSignOut && (
                        <button 
                          onClick={onSignOut}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <EnhancedButton variant="ghost">Sign In</EnhancedButton>
                <EnhancedButton>Sign Up</EnhancedButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            <EnhancedButton
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </EnhancedButton>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="py-4 space-y-2">
                {items.map((item) => (
                  <NavLink key={item.href} item={item} mobile />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export { EnhancedNavbar };

// Usage example
export const NavbarExample = () => {
  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Companies', href: '/companies' },
    { label: 'Reviews', href: '/reviews' },
    { 
      label: 'More', 
      href: '#',
      children: [
        { label: 'Wall of Fame', href: '/fame' },
        { label: 'Wall of Shame', href: '/shame' },
        { label: 'Rising Startups', href: '/rising-startups' },
        { label: 'Web Scraping', href: '/scraping' },
      ]
    },
  ];

  return (
    <EnhancedNavbar
      brand={{ name: 'RateMyEmployer', href: '/' }}
      items={navItems}
      user={{
        name: 'John Doe',
        email: 'john@example.com',
      }}
      showSearch
      notifications={3}
      variant="glass"
    />
  );
};
