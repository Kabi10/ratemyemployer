import React from 'react';
import { render, screen } from '@testing-library/react';
import { SpamIndicator } from '@/components/SpamIndicator';
import { vi } from 'vitest';

// Mock the TooltipProvider to make testing easier
vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
}));

// Mock the Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode, variant: string, className?: string }) => (
    <div data-testid={`badge-${variant}`} className={className}>{children}</div>
  ),
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  AlertCircle: () => <span data-testid="alert-circle-icon">AlertCircle</span>,
  Check: () => <span data-testid="check-icon">Check</span>,
  AlertTriangle: () => <span data-testid="alert-triangle-icon">AlertTriangle</span>,
  Info: () => <span data-testid="info-icon">Info</span>,
}));

describe('SpamIndicator', () => {
  // Helper function to advance timers for useEffect to complete
  const advanceTimers = async () => {
    // Use fake timers
    vi.useFakeTimers();
    // Advance timers to allow useEffect to complete
    vi.runAllTimers();
    // Restore real timers
    vi.useRealTimers();
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show analyzing state initially', () => {
    render(
      <SpamIndicator 
        reviewTitle="Test Review" 
        reviewContent="This is a test review content."
        reviewerId="user123"
      />
    );

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('should identify all caps title as potential spam', async () => {
    render(
      <SpamIndicator 
        reviewTitle="THIS IS AN ALL CAPS TITLE" 
        reviewContent="Normal content here."
        reviewerId="user123"
      />
    );

    await advanceTimers();

    // Should show possible spam indicator
    expect(screen.getByTestId('badge-warning')).toBeInTheDocument();
    expect(screen.getByText('Possible Spam')).toBeInTheDocument();
    
    // Check tooltip content
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('Title uses all capital letters');
  });

  it('should identify excessive punctuation as potential spam', async () => {
    render(
      <SpamIndicator 
        reviewTitle="Too many exclamation marks!!!!!!" 
        reviewContent="Normal content here."
        reviewerId="user123"
      />
    );

    await advanceTimers();

    // Should show possible spam indicator
    expect(screen.getByTestId('badge-warning')).toBeInTheDocument();
    expect(screen.getByText('Possible Spam')).toBeInTheDocument();
    
    // Check tooltip content
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('Excessive punctuation');
  });

  it('should identify very short review content as potential spam', async () => {
    render(
      <SpamIndicator 
        reviewTitle="Normal Title" 
        reviewContent="Too short"
        reviewerId="user123"
      />
    );

    await advanceTimers();

    // Should show possible spam indicator
    expect(screen.getByTestId('badge-warning')).toBeInTheDocument();
    expect(screen.getByText('Possible Spam')).toBeInTheDocument();
    
    // Check tooltip content
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('Very short review content');
  });

  it('should identify URLs in content as potential spam', async () => {
    render(
      <SpamIndicator 
        reviewTitle="Normal Title" 
        reviewContent="Check out this site https://spam-link.com for more info"
        reviewerId="user123"
      />
    );

    await advanceTimers();

    // Should show possible spam indicator
    expect(screen.getByTestId('badge-warning')).toBeInTheDocument();
    expect(screen.getByText('Possible Spam')).toBeInTheDocument();
    
    // Check tooltip content
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('Contains URLs');
  });

  it('should identify new accounts as potential spam', async () => {
    // Set a recent date (6 days ago)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 6);

    render(
      <SpamIndicator 
        reviewTitle="Normal Title" 
        reviewContent="Normal content with adequate length for testing."
        reviewerId="user123"
        reviewerJoinDate={recentDate.toISOString()}
      />
    );

    await advanceTimers();

    // Should show high risk
    expect(screen.getByTestId('badge-destructive')).toBeInTheDocument();
    expect(screen.getByText('High Spam Risk')).toBeInTheDocument();
    
    // Check tooltip content
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('Very new account (less than 7 days)');
  });

  it('should identify multiple spam indicators as high risk', async () => {
    render(
      <SpamIndicator 
        reviewTitle="BUY NOW!!!" 
        reviewContent="https://spam-site.com Check this out!!!"
        reviewerId="user123"
      />
    );

    await advanceTimers();

    // Should show high risk
    expect(screen.getByTestId('badge-destructive')).toBeInTheDocument();
    expect(screen.getByText('High Spam Risk')).toBeInTheDocument();
    
    // Check tooltip content
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('Excessive punctuation');
    expect(tooltipContent).toHaveTextContent('Contains URLs');
  });

  it('should identify repetitive words as potential spam', async () => {
    render(
      <SpamIndicator 
        reviewTitle="Normal Title" 
        reviewContent="Amazing amazing amazing amazing product! Great great great great company!"
        reviewerId="user123"
      />
    );

    await advanceTimers();

    // Should show possible spam
    expect(screen.getByTestId('badge-warning')).toBeInTheDocument();
    expect(screen.getByText('Possible Spam')).toBeInTheDocument();
    
    // Check tooltip content
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('Repetitive words');
  });

  it('should show genuine indicator for normal review content', async () => {
    // Set an older account join date
    const olderDate = new Date();
    olderDate.setFullYear(olderDate.getFullYear() - 1);

    render(
      <SpamIndicator 
        reviewTitle="My experience with the company" 
        reviewContent="I've been working here for 3 years. The team is supportive and the work environment is great. Management could improve communication though."
        reviewerId="user123"
        reviewerJoinDate={olderDate.toISOString()}
      />
    );

    await advanceTimers();

    // Should show genuine indicator
    expect(screen.getByTestId('badge-success')).toBeInTheDocument();
    expect(screen.getByText('Looks Genuine')).toBeInTheDocument();
    
    // Check tooltip content
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toHaveTextContent('No spam indicators detected');
  });
}); 