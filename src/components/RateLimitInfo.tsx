'use client';

import { useRemainingLimits } from '@/hooks/useRemainingLimits';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface RateLimitInfoProps {
  type: 'review' | 'company';
  showAlert?: boolean;
}

export function RateLimitInfo({ type, showAlert = false }: RateLimitInfoProps) {
  const { remainingLimits, loading, error } = useRemainingLimits();

  if (loading) {
    return <Skeleton className="w-full h-12" />;
  }

  if (error || !remainingLimits) {
    return null;
  }

  const remaining = type === 'review' 
    ? remainingLimits.remaining_reviews 
    : remainingLimits.remaining_companies;
  
  const resetHours = remainingLimits.reset_in_hours;
  
  // Only show when limits are low (2 or fewer remaining) or none left
  if (!showAlert && remaining > 2) {
    return null;
  }

  const getStatusColor = () => {
    if (remaining === 0) return 'destructive';
    if (remaining <= 2) return 'warning';
    return 'success';
  };

  if (remaining === 0) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Rate Limit Reached</AlertTitle>
        <AlertDescription className="flex flex-col gap-1">
          <p>You've reached your daily {type} submission limit.</p>
          <p className="text-sm flex items-center">
            <Clock className="mr-2 h-3 w-3" /> 
            Resets in approximately {Math.ceil(resetHours)} hour{resetHours !== 1 ? 's' : ''}
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant={getStatusColor()} className="mt-4">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Submission Limits</AlertTitle>
      <AlertDescription className="flex flex-col gap-1">
        <p>You have {remaining} {type}{remaining !== 1 ? 's' : ''} remaining today.</p>
        {resetHours > 0 && (
          <p className="text-sm flex items-center">
            <Clock className="mr-2 h-3 w-3" /> 
            Resets in approximately {Math.ceil(resetHours)} hour{resetHours !== 1 ? 's' : ''}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
} 