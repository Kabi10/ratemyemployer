/**
 * Company Logo or Placeholder Component - Optimized for MVP
 */

import React from 'react';
import { Building2 } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  logo_url?: string | null;
}

interface CompanyLogoOrPlaceholderProps {
  company: Company;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompanyLogoOrPlaceholder({ 
  company, 
  size = 'md', 
  className = '' 
}: CompanyLogoOrPlaceholderProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (company.logo_url) {
    return (
      <img
        src={company.logo_url}
        alt={`${company.name} logo`}
        className={`${sizeClasses[size]} object-cover rounded ${className}`}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const placeholder = target.nextElementSibling as HTMLElement;
          if (placeholder) {
            placeholder.style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-gray-100 rounded flex items-center justify-center ${className}`}>
      <Building2 className={`${iconSizes[size]} text-gray-400`} />
    </div>
  );
}