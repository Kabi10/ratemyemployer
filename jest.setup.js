require('@testing-library/jest-dom');

// Extend Jest matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null;
    return {
      message: () => `expected ${received} to be in the document`,
      pass,
    };
  },
  toHaveTextContent(received, expected) {
    const text = received.textContent || received.innerText;
    const pass = text.match(expected);
    return {
      message: () => `expected ${text} to match ${expected}`,
      pass,
    };
  },
});

// Mock next/navigation
const useRouter = jest.fn();
const push = jest.fn();
const back = jest.fn();
const events = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

const router = {
  push,
  back,
  events,
};

useRouter.mockReturnValue(router);

jest.mock('next/navigation', () => ({
  useRouter,
  usePathname: jest.fn().mockReturnValue('/'),
}));

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
  })),
})); 