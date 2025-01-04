/**
 * src/components/ReviewForm.tsx
 * Review form component for creating and editing reviews
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from './LoadingSpinner';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, type ReviewFormData } from '@/lib/schemas';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Company, Review } from '@/types';

interface ReviewFormProps {
  companyId?: string;
  initialData?: Review;
  onSuccess?: () => void;
}

export function ReviewForm({ companyId, initialData, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialData?.rating || 3,
      content: initialData?.content || '',
      position: initialData?.position || '',
      employment_status:
        (initialData?.employment_status as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN') ||
        'FULL_TIME',
    },
  });

  const rating = watch('rating');

  useEffect(() => {
    let isMounted = true;

    const fetchCompanyData = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (error) throw error;

        if (isMounted) {
          setSelectedCompany(data);
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Failed to load company data');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCompanyData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      router.push('/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const company_id = selectedCompany?.id || companyId;
    if (!company_id) {
      setError('Please select a company');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      if (initialData?.id) {
        // Update existing review
        const { data: existingReview, error: checkError } = await supabase
          .from('reviews')
          .select('id, user_id')
          .eq('id', initialData.id)
          .single();

        if (checkError) {
          console.error('Error checking existing review:', checkError);
          throw new Error('Failed to verify review ownership');
        }

        if (existingReview?.user_id !== user.id) {
          throw new Error('You can only edit your own reviews');
        }

        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            rating: data.rating,
            content: data.content,
            position: data.position,
            employment_status: data.employment_status,
            title: data.content.slice(0, 100)
          })
          .eq('id', initialData.id);

        if (updateError) {
          console.error('Error updating review:', updateError);
          throw updateError;
        }
      } else {
        // Insert new review
        console.log('Inserting review with data:', {
          rating: data.rating,
          content: data.content,
          position: data.position,
          employment_status: data.employment_status,
          company_id,
          user_id: user.id,
          title: data.content.slice(0, 100)
        });
        
        const { error: insertError } = await supabase
          .from('reviews')
          .insert([{
            rating: data.rating,
            content: data.content,
            position: data.position,
            employment_status: data.employment_status,
            company_id,
            user_id: user.id,
            title: data.content.slice(0, 100)
          }]);

        if (insertError) {
          console.error('Error inserting review:', insertError);
          throw insertError;
        }
      }

      reset();
      if (onSuccess) onSuccess();
      router.push(`/companies/${company_id}`);
    } catch (err) {
      console.error('Review submission error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`p-2 rounded-full ${
                Number(rating) >= value
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-gray-400'
              }`}
              onClick={() => {
                setValue('rating', value, { shouldValidate: true });
              }}
            >
              ★
            </button>
          ))}
        </div>
        <input type="hidden" {...register('rating', { valueAsNumber: true })} />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
        <Input
          {...register('position')}
          placeholder="e.g., Software Engineer"
          className="w-full"
        />
        {errors.position && (
          <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
        )}
      </div>

      {/* Employment Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
        <select
          {...register('employment_status')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERN">Intern</option>
        </select>
        {errors.employment_status && (
          <p className="mt-1 text-sm text-red-600">{errors.employment_status.message}</p>
        )}
      </div>

      {/* Review Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
        <textarea
          {...register('content')}
          rows={4}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Share your overall experience..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner className="mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </div>
    </form>
  );
}