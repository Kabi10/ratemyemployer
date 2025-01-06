import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanyCard } from '@/components/CompanyCard';
import type { Company } from '@/types';

// Mock company data
const mockCompany: Company = {
  id: 1,
  name: 'Test Company',
  industry: 'Technology',
  website: 'https://test.com',
  logo_url: null,
  created_at: new Date().toISOString(),
  benefits: null,
  company_values: null,
  ceo: null,
  verification_status: 'pending',
  average_rating: 0,
  total_reviews: 0,
  description: null,
  recommendation_rate: 0,
  updated_at: new Date().toISOString(),
  created_by: null,
  verified: false,
  verification_date: null,
  location: 'Test Location',
  size: undefined
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