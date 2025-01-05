import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewForm } from '../components/ReviewForm';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabaseClient';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Create a more complete mock implementation
const createMockQueryBuilder = (mockInsert: jest.Mock) => ({
  insert: mockInsert,
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  textSearch: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
  csv: jest.fn().mockReturnThis(),
  then: jest.fn().mockReturnThis(),
  catch: jest.fn().mockReturnThis(),
  finally: jest.fn().mockReturnThis(),
});

// Mock supabaseClient
const mockClient = {
  from: jest.fn((table) => createMockQueryBuilder(jest.fn().mockResolvedValue({ data: null, error: null }))),
  getSession: jest.fn().mockResolvedValue({
    data: { session: { user: { id: 'test-user-id' } } },
  }),
  onAuthStateChange: jest.fn((callback) => {
    callback('SIGNED_IN', { user: { id: 'test-user-id' } });
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  }),
};

jest.mock('../lib/supabaseClient', () => ({
  createClient: jest.fn(() => mockClient),
}));

// Mock useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isLoading: false,
  }),
}));

describe('ReviewForm', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('handles form submission correctly', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
    mockClient.from.mockImplementation((table) => createMockQueryBuilder(mockInsert));

    render(<ReviewForm companyId="test-company" />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Great Company' },
    });
    fireEvent.change(screen.getByLabelText(/position/i), {
      target: { value: 'Software Engineer' },
    });
    fireEvent.change(screen.getByLabelText(/review/i), {
      target: { value: 'Amazing work environment' },
    });

    // Submit the form
    fireEvent.click(screen.getByText(/submit review/i));

    // Wait for form submission to complete
    await waitFor(() => {
      expect(mockClient.from).toHaveBeenCalledWith('reviews');
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          title: 'Great Company',
          position: 'Software Engineer',
          content: 'Amazing work environment',
        })
      ]);
    });
  });

  it('handles API errors correctly', async () => {
    const mockError = { message: 'Error submitting review' };
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: mockError });
    mockClient.from.mockImplementation((table) => createMockQueryBuilder(mockInsert));

    render(<ReviewForm companyId="test-company" />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByLabelText(/position/i), {
      target: { value: 'Test Position' },
    });
    fireEvent.change(screen.getByLabelText(/review/i), {
      target: { value: 'Test Content' },
    });

    // Submit the form
    fireEvent.click(screen.getByText(/submit review/i));

    await waitFor(() => {
      const errorMessage = screen.getByText(/failed to submit review/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('validates email format when provided', async () => {
    render(<ReviewForm companyId="test-company" />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, {
      target: { value: 'invalid-email' },
    });

    // Trigger validation by submitting the form
    fireEvent.click(screen.getByText(/submit review/i));

    await waitFor(() => {
      const errorMessage = screen.getByText(/invalid email/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('validates required fields', async () => {
    render(<ReviewForm companyId="test-company" />);

    // Submit without filling required fields
    fireEvent.click(screen.getByText(/submit review/i));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/position is required/i)).toBeInTheDocument();
      expect(screen.getByText(/review content is required/i)).toBeInTheDocument();
      expect(screen.getByText(/rating is required/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 