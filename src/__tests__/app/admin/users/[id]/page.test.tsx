import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserDetailsPage from '@/app/admin/users/[id]/page';
import { createClient } from '@/lib/supabaseClient';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-user-id' }),
  useRouter: () => ({
    back: vi.fn(),
  }),
}));

// Mock supabaseClient
vi.mock('@/lib/supabaseClient', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        getUserById: vi.fn(),
        updateUserById: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [] })),
        })),
      })),
    })),
  })),
}));

// Mock useToast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock AdminLayout
vi.mock('@/components/layouts/AdminLayout', () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('UserDetailsPage', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: { role: 'user', provider: 'email' },
    user_metadata: {
      full_name: 'Test User',
      phone: '+1234567890',
      company: 'Test Company',
      location: 'Test Location',
    },
    created_at: '2024-01-01T00:00:00Z',
    last_sign_in_at: '2024-01-02T00:00:00Z',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    phone_confirmed_at: null,
    confirmed_at: '2024-01-01T00:00:00Z',
    last_sign_in_ip: '127.0.0.1',
    banned_until: null,
    deleted_at: null,
  };

  const mockActivities = [
    {
      id: 1,
      created_at: '2024-01-03T00:00:00Z',
      company: { name: 'Test Company' },
    },
  ];

  const mockRoleHistory = [
    {
      id: 'change-1',
      user_email: 'test@example.com',
      changed_by_email: 'admin@example.com',
      previous_role: 'user',
      new_role: 'moderator',
      reason: 'Promotion to moderator',
      created_at: '2024-01-03T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as jest.Mock).mockImplementation(() => ({
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
          updateUserById: vi.fn().mockResolvedValue({ error: null }),
        },
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn((order) => {
              if (order === 'created_at') {
                return Promise.resolve({ data: mockActivities });
              }
              return Promise.resolve({ data: mockRoleHistory });
            }),
          })),
        })),
      })),
    }));
  });

  it('renders loading state initially', () => {
    render(<UserDetailsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays user details after loading', async () => {
    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });
  });

  it('handles user not found', async () => {
    (createClient as jest.Mock).mockImplementation(() => ({
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      from: vi.fn(),
    }));

    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('User Not Found')).toBeInTheDocument();
    });
  });

  it('handles error when fetching user details', async () => {
    (createClient as jest.Mock).mockImplementation(() => ({
      auth: {
        admin: {
          getUserById: vi.fn().mockRejectedValue(new Error('Failed to fetch')),
        },
      },
      from: vi.fn(),
    }));

    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch user data. Please try again.')).toBeInTheDocument();
    });
  });

  it('allows switching between tabs', async () => {
    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Activity' }));
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Security' }));
    expect(screen.getByText('Security Information')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'History' }));
    expect(screen.getByText('Role Change History')).toBeInTheDocument();
  });

  it('displays user activities', async () => {
    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Activity' }));

    await waitFor(() => {
      expect(screen.getByText(/Posted a review for Test Company/)).toBeInTheDocument();
    });
  });

  it('displays role change history', async () => {
    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'History' }));

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('Promotion to moderator')).toBeInTheDocument();
    });
  });

  it('handles banning a user', async () => {
    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Security' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ban User' }));

    await waitFor(() => {
      expect(screen.getByText('User has been banned for 30 days.')).toBeInTheDocument();
    });
  });

  it('handles unbanning a user', async () => {
    const bannedUser = {
      ...mockUser,
      banned_until: '2024-02-01T00:00:00Z',
    };

    (createClient as jest.Mock).mockImplementation(() => ({
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({ data: { user: bannedUser } }),
          updateUserById: vi.fn().mockResolvedValue({ error: null }),
        },
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [] })),
          })),
        })),
      })),
    }));

    render(<UserDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Account Banned')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Unban User' }));

    await waitFor(() => {
      expect(screen.getByText('User has been unbanned.')).toBeInTheDocument();
    });
  });
}); 
