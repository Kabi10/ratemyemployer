import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../page';

vi.mock('@/lib/supabaseClient', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    })),
  })),
  supabase: { from: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })),
}));

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByText('Rate My Employer')).toBeInTheDocument();
    expect(screen.getByText('Share Your Work Experience')).toBeInTheDocument();
  });

  it('renders the search section', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText('Search for a company...')).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<Home />);
    expect(
      screen.getByText(/join our community to share and discover authentic workplace experiences/i)
    ).toBeInTheDocument();
  });

  it('renders the search input', () => {
    render(<Home />);
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search for a company...');
  });
});
