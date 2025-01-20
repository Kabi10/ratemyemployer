import { render, screen } from '@testing-library/react';
import type { Database } from '@/types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];

import { describe, it, expect, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import { CompanyCard } from '@/components/CompanyCard';
import { Input } from '@/components/ui/input';

// Mock company data
const mockCompany: Company = {
  id: 1,
  name: 'Test Company',
  industry: 'Technology',
  description: 'A test company',
  location: 'Test Location',
  website: 'https://test.com',
  ceo: 'Test CEO',
  average_rating: 0,
  total_reviews: 0,
  recommendation_rate: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

describe('RateMyEmployer App', () => {
  describe('UI Components', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders input with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders company card with basic info', () => {
      render(<CompanyCard company={mockCompany} />);
      expect(screen.getByText(mockCompany.name)).toBeInTheDocument();
    });
  });
});