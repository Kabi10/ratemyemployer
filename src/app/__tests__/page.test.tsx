import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../page';

jest.mock('@/lib/supabaseClient', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue({ data: [], error: null })
        }))
      }))
    }))
  }))
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }))
}));

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const mainHeading = screen.getByText('Rate My Employer');
    const subHeading = screen.getByText('Share Your Work Experience');
    expect(mainHeading).toBeInTheDocument();
    expect(subHeading).toBeInTheDocument();
  });

  it('renders the search section', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText('Search for a company...')).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<Home />);
    expect(screen.getByText(/join our community to share and discover authentic workplace experiences/i)).toBeInTheDocument();
  });

  it('renders the search input', () => {
    render(<Home />);
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search for a company...');
  });
}); 