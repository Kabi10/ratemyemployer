import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewForm } from '../components/ReviewForm';

// NOTE: the previous suite here tested ReviewForm with a non-numeric companyId and
// asserted validation messages/behaviour the component no longer has (it was written
// for an earlier version + Jest). Replaced with a focused smoke test of the actual form.

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('../lib/supabaseClient', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  }),
  supabase: {},
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' }, isLoading: false }),
}));

describe('ReviewForm', () => {
  it('renders the core review form fields', () => {
    render(<ReviewForm />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
    expect(screen.getByText(/submit review/i)).toBeInTheDocument();
  });
});
