import { useDebounce } from './useDebounce';

// Declare test globals
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: {
  (value: any): {
    toBe: (expected: any) => void;
  };
};
declare const jest: {
  useFakeTimers: () => void;
  advanceTimersByTime: (ms: number) => void;
  mock: (path: string, factory?: () => any) => void;
};

// Mock React hooks
jest.mock('react', () => {
  let value: any;
  return {
    useState: (initial: any) => [
      value ?? initial,
      (newValue: any) => {
        value = newValue;
      },
    ],
    useEffect: (fn: () => void) => fn(),
  };
});

describe('useDebounce', () => {
  jest.useFakeTimers();

  it('should return the initial value immediately', () => {
    const result = useDebounce('initial', 500);
    expect(result).toBe('initial');
  });

  it('should debounce value changes', () => {
    let result = useDebounce('initial', 500);
    expect(result).toBe('initial');

    // Change the value
    result = useDebounce('changed', 500);
    expect(result).toBe('initial'); // Should still be initial

    // Fast-forward time
    jest.advanceTimersByTime(500);
    result = useDebounce('changed', 500);
    expect(result).toBe('changed');
  });

  it('should cancel previous timeout on new value', () => {
    let result = useDebounce('initial', 500);
    expect(result).toBe('initial');

    // Change value
    result = useDebounce('changed1', 500);

    // Advance time partially
    jest.advanceTimersByTime(250);
    expect(result).toBe('initial');

    // Change value again before first change is applied
    result = useDebounce('changed2', 500);

    // Advance time to just after first timeout would have fired
    jest.advanceTimersByTime(300);
    expect(result).toBe('initial');

    // Advance time to when second change should be applied
    jest.advanceTimersByTime(250);
    result = useDebounce('changed2', 500);
    expect(result).toBe('changed2');
  });
});
