import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReviewForm } from '../ReviewForm';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Mock the dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/supabaseClient');
jest.mock('next/navigation');

describe('ReviewForm', () => {
  const mockUser = { id: 'test-user-id' };
  const mockRouter = { push: jest.fn() };
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: { id: 'test-company-id', name: 'Test Company' } }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  it('renders the form correctly', () => {
    render(<ReviewForm />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/employment status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pros/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cons/i)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<ReviewForm />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/content must be at least 20 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/pros must be at least 10 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/cons must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully', async () => {
    render(<ReviewForm companyId="test-company-id" onSuccess={mockOnSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Great Company' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'This is a detailed review of my experience working at this company.' },
    });
    fireEvent.change(screen.getByLabelText(/rating/i), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText(/pros/i), {
      target: { value: 'Great work environment and benefits' },
    });
    fireEvent.change(screen.getByLabelText(/cons/i), {
      target: { value: 'Sometimes work can be challenging' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('reviews');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/companies/test-company-id');
    });
  });

  it('handles submission error', async () => {
    const errorMessage = 'Failed to submit review';
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: new Error(errorMessage) }),
    });

    render(<ReviewForm companyId="test-company-id" />);

    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Great Company' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'This is a detailed review of my experience working at this company.' },
    });
    fireEvent.change(screen.getByLabelText(/rating/i), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText(/pros/i), {
      target: { value: 'Great work environment and benefits' },
    });
    fireEvent.change(screen.getByLabelText(/cons/i), {
      target: { value: 'Sometimes work can be challenging' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
