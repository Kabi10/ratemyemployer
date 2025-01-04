import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewForm } from '@/components/ReviewForm';
import CreateReview from '@/components/CreateReview';
import { useDebounce } from '@/hooks/useDebounce';
import { act } from 'react-dom/test-utils';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    select: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
};

jest.mock('@/lib/supabase-client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Components', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id' },
      isLoading: false,
    });
  });

  describe('ReviewForm', () => {
    const mockOnSubmit = jest.fn();
    const defaultProps = {
      onSubmit: mockOnSubmit,
      defaultValues: {
        rating: 0,
        title: '',
        content: '',
        pros: '',
        cons: '',
      },
      isSubmitting: false,
      companyId: 'test-company-id',
    };

    it('renders the form correctly', async () => {
      render(<ReviewForm {...defaultProps} />);

      expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/review/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pros/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cons/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('shows validation errors for required fields', async () => {
      render(<ReviewForm {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/rating is required/i)).toBeInTheDocument();
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/review is required/i)).toBeInTheDocument();
      });
    });

    it('submits the form successfully', async () => {
      render(<ReviewForm {...defaultProps} />);

      fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Great Company' } });
      fireEvent.change(screen.getByLabelText(/review/i), { target: { value: 'Awesome place to work' } });
      fireEvent.change(screen.getByLabelText(/pros/i), { target: { value: 'Good benefits' } });
      fireEvent.change(screen.getByLabelText(/cons/i), { target: { value: 'Long hours' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          rating: 5,
          title: 'Great Company',
          content: 'Awesome place to work',
          pros: 'Good benefits',
          cons: 'Long hours',
        }, expect.any(Object));
      });
    });
  });

  describe('CreateReview', () => {
    const mockCompanyId = 'test-company-id';

    beforeEach(() => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: { id: 'new-review-id' }, error: null }),
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      });
    });

    it('renders the form correctly', async () => {
      render(<CreateReview companyId={mockCompanyId} />);

      expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/review/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pros/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cons/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('shows validation errors for required fields', async () => {
      render(<CreateReview companyId={mockCompanyId} />);
      
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/rating is required/i)).toBeInTheDocument();
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/review is required/i)).toBeInTheDocument();
      });
    });

    it('submits the review successfully', async () => {
      const router = { push: jest.fn() };
      (useRouter as jest.Mock).mockReturnValue(router);

      render(<CreateReview companyId={mockCompanyId} />);

      fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Great Company' } });
      fireEvent.change(screen.getByLabelText(/review/i), { target: { value: 'Awesome place to work' } });
      fireEvent.change(screen.getByLabelText(/pros/i), { target: { value: 'Good benefits' } });
      fireEvent.change(screen.getByLabelText(/cons/i), { target: { value: 'Long hours' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('reviews');
        expect(router.push).toHaveBeenCalledWith('/companies/' + mockCompanyId);
      });
    });

    it('handles submission error', async () => {
      const error = { message: 'Failed to submit review' };
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: null, error }),
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      render(<CreateReview companyId={mockCompanyId} />);

      fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Great Company' } });
      fireEvent.change(screen.getByLabelText(/review/i), { target: { value: 'Awesome place to work' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(error.message)).toBeInTheDocument();
      });
    });
  });

  describe('useDebounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return the initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 1000));
      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
      interface HookProps {
        value: string;
        delay: number;
      }

      const { result, rerender } = renderHook(
        ({ value, delay }: HookProps) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 1000 } }
      );

      expect(result.current).toBe('initial');

      // Change the value
      rerender({ value: 'changed', delay: 1000 });

      // Value shouldn't change immediately
      expect(result.current).toBe('initial');

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Now the value should be updated
      expect(result.current).toBe('changed');
    });

    it('should cancel previous timeout on new value', () => {
      interface HookProps {
        value: string;
        delay: number;
      }

      const { result, rerender } = renderHook(
        ({ value, delay }: HookProps) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 1000 } }
      );

      // Change value multiple times
      rerender({ value: 'first', delay: 1000 });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      rerender({ value: 'second', delay: 1000 });
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should only get the latest value
      expect(result.current).toBe('second');
    });
  });
}); 