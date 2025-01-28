'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabaseClient';
import { reviewSchema, type ReviewFormData, employmentStatusEnum } from '@/lib/schemas';
import { useAuth } from '@/contexts/AuthContext';
import type { CompanyId, JoinedCompany, ReviewInsert, Review } from '@/types/database';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LoadingSpinner } from './ui/loading-spinner';
import { useToast } from './ui/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * src/components/ReviewForm.tsx
 * Review form component for creating and editing reviews
 */

// External imports

// Internal imports

interface ReviewFormProps {
  companyId: number;
  onSuccess?: () => void;
  onSubmit?: (data: ReviewFormData) => Promise<void>;
  initialData?: Partial<ReviewFormData>;
}

const commonPositions = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Customer Support',
  'Human Resources',
  'Financial Analyst',
  'Project Manager',
  'Business Analyst',
  'Operations Manager',
  'Account Manager',
  'Quality Assurance',
  'DevOps Engineer'
];

const employmentOptions = [
  { value: 'Full-time', label: 'Full Time' },
  { value: 'Part-time', label: 'Part Time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Intern', label: 'Intern' }
];

export const ReviewForm = ({
  initialData,
  companyId,
  onSubmit,
  onSuccess
}: ReviewFormProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<JoinedCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      company_id: companyId,
      title: '',
      rating: 0,
      pros: '',
      cons: '',
      position: '',
      status: 'pending' as const,
      employment_status: 'Full-time' as const,
      is_current_employee: false,
      reviewer_name: '',
      reviewer_email: '',
      ...initialData
    }
  });

  const rating = watch('rating');
  const position = watch('position');
  const pros = watch('pros');
  const cons = watch('cons');

  useEffect(() => {
    let isMounted = true;

    const fetchCompanyData = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: company, error } = await supabase
          .from('companies')
          .select('*, reviews(*)')
          .eq('id', companyId)
          .single();

        if (error) throw error;

        if (isMounted && company) {
          setSelectedCompany(company as JoinedCompany);
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        toast({
          title: "Error",
          description: "Failed to load company data. Please try again.",
          variant: "destructive",
        });
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
  }, [companyId, toast]);

  const handleFormSubmit = async (data: ReviewFormData) => {
    console.log('Form submission started', { data });  // Debug log
    
    if (!user) {
      console.log('No user found, redirecting to login');  // Debug log
      router.push('/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!companyId) {
      console.log('No company ID found');  // Debug log
      toast({
        title: "Error",
        description: "Company ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Attempting to submit review');  // Debug log

      // If onSubmit prop is provided, use it
      if (onSubmit) {
        console.log('Using provided onSubmit handler');  // Debug log
        await onSubmit(data);
      } else {
        console.log('Submitting directly to Supabase');  // Debug log
        // Otherwise, submit directly to Supabase
        const { data: supabaseData, error } = await supabase
          .from('reviews')
          .insert({
            title: data.title,
            rating: data.rating,
            pros: data.pros,
            cons: data.cons,
            position: data.position,
            employment_status: data.employment_status,
            is_current_employee: data.is_current_employee,
            reviewer_name: data.reviewer_name,
            reviewer_email: data.reviewer_email,
            company_id: companyId,
            user_id: user.id,
            status: 'pending'
          })
          .select('*');

        console.log('Supabase insert response:', {
          data: supabaseData,
          error: error,
          status: error?.code
        });

        if (error) {
          console.error('Supabase error:', error);  // Debug log
          throw error;
        }

        console.log('Review submitted successfully');  // Debug log
        toast({
          title: "Success",
          description: "Your review has been submitted successfully and is pending approval.",
        });
      }

      reset();
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Full error object:', error);
      
      // Handle Supabase PostgrestError
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Supabase error details:', {
          code: (error as PostgrestError).code,
          details: (error as PostgrestError).details,
          hint: (error as PostgrestError).hint,
          message: (error as PostgrestError).message
        });
      }
      // Handle generic errors
      else if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      // Handle non-Error objects
      else {
        console.error('Unknown error type:', JSON.stringify(error));
      }

      const message = error instanceof Error ? error.message : 'Failed to submit review';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" role="status" aria-label="Loading form...">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        console.log('Form onSubmit triggered');  // Debug log
        handleSubmit(handleFormSubmit)(e);
      }} 
      className="space-y-6"
    >
      {/* Company Name */}
      {selectedCompany && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Review for {selectedCompany.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Share your experience working at {selectedCompany.name}
          </p>
        </div>
      )}

      {/* Rating */}
      <div>
        <div role="group" aria-label="Rating">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="rating-label">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('rating', value)}
                  className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${rating >= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                  aria-label={`Rate ${value} out of 5 stars`}
                  aria-pressed={rating >= value}
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
              {rating || 0} out of 5 stars
            </span>
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="title-label">
          Review Title <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('title')}
          type="text"
          placeholder="Summarize your experience in a title"
          className="w-full"
          aria-labelledby="title-label"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="position-label">
          Position <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('position')}
          type="text"
          list="positions"
          placeholder="Your job title"
          className="w-full"
          aria-labelledby="position-label"
        />
        <datalist id="positions">
          {commonPositions.map((pos) => (
            <option key={pos} value={pos} />
          ))}
        </datalist>
        {errors.position && (
          <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
        )}
      </div>

      {/* Employment Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="employment-status-label">
          Employment Status <span className="text-red-500">*</span>
        </label>
        <select
          {...register('employment_status')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          aria-labelledby="employment-status-label"
        >
          {employmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.employment_status && (
          <p className="mt-1 text-sm text-red-600">{errors.employment_status.message}</p>
        )}
      </div>

      {/* Current Employee */}
      <div className="flex items-center">
        <input
          {...register('is_current_employee')}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          id="is-current-employee"
        />
        <label
          htmlFor="is-current-employee"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          I currently work here
        </label>
      </div>

      {/* Pros */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="pros-label">
          Pros <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('pros')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          rows={3}
          placeholder="What did you like about working here? (minimum 10 characters)"
          maxLength={1000}
          aria-labelledby="pros-label"
        />
        {errors.pros && (
          <p className="mt-1 text-sm text-red-600">{errors.pros.message}</p>
        )}
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {1000 - (pros?.length || 0)} characters remaining
        </div>
      </div>

      {/* Cons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="cons-label">
          Cons <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('cons')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          rows={3}
          placeholder="What could be improved? (minimum 10 characters)"
          maxLength={1000}
          aria-labelledby="cons-label"
        />
        {errors.cons && (
          <p className="mt-1 text-sm text-red-600">{errors.cons.message}</p>
        )}
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {1000 - (cons?.length || 0)} characters remaining
        </div>
      </div>

      {/* Reviewer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="reviewer-name-label">
          Your Name (optional)
        </label>
        <Input
          {...register('reviewer_name')}
          type="text"
          placeholder="Your name (optional)"
          className="w-full"
        />
      </div>

      {/* Reviewer Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="reviewer-email-label">
          Your Email (optional)
        </label>
        <Input
          {...register('reviewer_email')}
          type="email"
          placeholder="Your email (optional)"
          className="w-full"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </div>
    </form>
  );
};