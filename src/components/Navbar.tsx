'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Menu, User, X, Star, TrendingUp, Bot, Building, MessageSquare, Trophy, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedNavbar, type NavItem } from '@/components/ui/enhanced-navbar';
import { useTheme } from 'next-themes';

export function Navbar(): JSX.Element {
  const { user, isLoading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Navigation items with enhanced structure
  const navItems: NavItem[] = [
    {
      label: 'Companies',
      href: '/companies',
      icon: <Building className="h-4 w-4" />
    },
    {
      label: 'Reviews',
      href: '/reviews',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      label: 'Insights',
      href: '#',
      icon: <Star className="h-4 w-4" />,
      children: [
        {
          label: 'Wall of Fame',
          href: '/fame',
          icon: <Trophy className="h-4 w-4" />
        },
        {
          label: 'Wall of Shame',
          href: '/shame',
          icon: <AlertTriangle className="h-4 w-4" />
        },
        {
          label: 'Financial Distress',
          href: '/financial-distress',
          icon: <AlertTriangle className="h-4 w-4" />
        },
        {
          label: 'Rising Startups',
          href: '/rising-startups',
          icon: <TrendingUp className="h-4 w-4" />
        },
      ]
    },
    {
      label: 'Tools',
      href: '#',
      icon: <Bot className="h-4 w-4" />,
      children: [
        {
          label: 'Web Scraping',
          href: '/scraping',
          icon: <Bot className="h-4 w-4" />
        },
        {
          label: 'Background Check',
          href: '/background-check',
          icon: <User className="h-4 w-4" />
        },
        {
          label: 'Analytics',
          href: '/analytics',
          icon: <TrendingUp className="h-4 w-4" />
        },
        {
          label: 'Design System',
          href: '/design-system',
          icon: <Star className="h-4 w-4" />
        },
      ]
    },
  ];

  return (
    <EnhancedNavbar
      brand={{
        name: 'RateMyEmployer',
        href: '/',
        logo: (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
        )
      }}
      items={navItems}
      user={user ? {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url
      } : undefined}
      onSignOut={handleSignOut}
      onThemeToggle={handleThemeToggle}
      isDark={theme === 'dark'}
      variant="glass"
      sticky={true}
      showSearch={false}
      notifications={0}
    />
  );
}