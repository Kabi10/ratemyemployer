import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EnhancedCompanyCard } from '@/components/EnhancedCompanyCard';
import type { CompanyWithReviews } from '@/types/database';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockCompany: CompanyWithReviews = {
  id: '1',
  name: 'Test Company',
  industry: 'Technology',
  location: 'San Francisco, CA',
  size: '100-500',
  website: 'https://test.com',
  description: 'A test company for unit testing',
  average_rating: 4.2,
  review_count: 25,
  recommend_percentage: 85,
  created_at: '2024-01-01T00:00:00Z',
  reviews: [
    {
      id: '1',
      rating: 4,
      title: 'Great place to work',
      pros: 'Good culture',
      cons: 'Long hours',
      recommend: true,
      created_at: '2024-01-01T00:00:00Z',
      status: 'approved',
    },
  ],
};

describe('EnhancedCompanyCard', () => {
  it('renders company name and basic information', () => {
    render(
      <EnhancedCompanyCard
        company={mockCompany}
        rank={1}
        news={[]}
        isWallOfFame={true}
      />
    );

    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('displays the correct rating', () => {
    render(
      <EnhancedCompanyCard
        company={mockCompany}
        rank={1}
        news={[]}
        isWallOfFame={true}
      />
    );

    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
  });

  it('shows rank badge for Wall of Fame', () => {
    render(
      <EnhancedCompanyCard
        company={mockCompany}
        rank={1}
        news={[]}
        isWallOfFame={true}
      />
    );

    expect(screen.getByText('1st Place')).toBeInTheDocument();
  });

  it('displays data freshness indicator', () => {
    render(
      <EnhancedCompanyCard
        company={mockCompany}
        rank={1}
        news={[]}
        isWallOfFame={true}
      />
    );

    // Should show "Limited Data" since no news is provided
    expect(screen.getByText('Limited Data')).toBeInTheDocument();
  });

  it('renders View Details link with correct href', () => {
    render(
      <EnhancedCompanyCard
        company={mockCompany}
        rank={1}
        news={[]}
        isWallOfFame={true}
      />
    );

    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/companies/1');
  });

  it('renders show/hide news button', () => {
    render(
      <EnhancedCompanyCard
        company={mockCompany}
        rank={1}
        news={[]}
        isWallOfFame={true}
      />
    );

    // Should show the news toggle button
    expect(screen.getByText('Show News')).toBeInTheDocument();
  });
});
