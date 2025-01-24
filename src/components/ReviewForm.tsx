'use client'


import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';


import { createClient, dbQuery, handleSupabaseError } from '@/lib/supabaseClient';
import { reviewSchema, type ReviewFormData, employmentStatusEnum } from '@/lib/schemas';

import { useAuth } from '@/contexts/AuthContext';

import type { Database } from '@/types/supabase';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { LoadingSpinner } from './LoadingSpinner';


/**
 * src/components/ReviewForm.tsx
 * Review form component for creating and editing reviews
 */

// External imports




// Internal imports







type Company = Database['public']['Tables']['companies']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];
type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
type ReviewStatus = Database['public']['Enums']['review_status'];

interface ReviewFormProps {
  companyId?: string | number;
  initialData?: Review;
  onSuccess?: () => void;
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

export function ReviewForm({ companyId, initialData, onSuccess }: ReviewFormProps): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prosLength, setProsLength] = useState(0);
  const [consLength, setConsLength] = useState(0);

  const defaultValues = {
    rating: initialData?.rating || 3,
    title: initialData?.title || '',
    position: initialData?.position || '',
    employment_status: (initialData?.employment_status || 'Full-time') as typeof employmentStatusEnum[number],
    is_current_employee: initialData?.is_current_employee || false,
    status: initialData?.status || 'pending',
    pros: initialData?.pros || '',
    cons: initialData?.cons || ''
  };

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues,
  });

  const rating = form.watch('rating');
  const position = form.watch('position');

  useEffect(() => {
    let isMounted = true;

    const fetchCompanyData = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const numericId = typeof companyId === 'string' ? parseInt(companyId, 10) : companyId;
        
        const { data: companyData, error } = await supabase
          .from('companies')
          .select()
          .eq('id', numericId)
          .limit(1)
          .then(({ data, error }) => ({
            data: data?.[0] as Company | null,
            error
          }));

        if (error) throw error;

        if (isMounted && companyData) {
          setSelectedCompany(companyData);
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError(handleSupabaseError(err));
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
    console.log('Form submission started', { data });
    
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const numericCompanyId = typeof companyId === 'string' ? parseInt(companyId, 10) : companyId;
    if (!numericCompanyId) {
      console.error('No company ID found');
      setError('Please select a company');
      return;
    }

    if (!data.pros || !data.cons) {
      setError('Please provide both pros and cons');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Creating review for company:', numericCompanyId, 'with data:', data);

      // Generate title from pros/cons
      const firstPro = data.pros.split('.')[0].trim();
      const firstCon = data.cons.split('.')[0].trim();
      const generatedTitle = `${firstPro.substring(0, 50)}... but ${firstCon.substring(0, 50)}...`;

      // Generate content from pros and cons
      const content = `Pros:\n${data.pros}\n\nCons:\n${data.cons}`;

      const reviewFormData: ReviewFormData = {
        ...data,
        title: generatedTitle,
        content,
        company_id: numericCompanyId
      };

      console.log('Submitting review with data:', reviewFormData);

      try {
        const { error: createError } = await dbQuery.reviews.create(reviewFormData, user.id);
        console.log('Review creation response:', { error: createError });

        if (createError) {
          console.error('Error creating review:', createError);
          throw createError;
        }

        console.log('Review created successfully');
        
        // Redirect to company page after successful submission
        router.push(`/companies/${numericCompanyId}`);
        router.refresh();
        onSuccess?.();
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(handleSupabaseError(err));
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

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
                  onClick={() => form.setValue('rating', value)}
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
              {rating} out of 5 stars
            </span>
          </div>
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="position-label">
          Position <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            {...form.register('position')}
            type="text"
            placeholder="e.g. Software Engineer"
            list="common-positions"
            className="w-full"
            aria-labelledby="position-label"
          />
          <datalist id="common-positions">
            {commonPositions.map((pos) => (
              <option key={pos} value={pos} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Employment Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="employment-status-label">
          Employment Status <span className="text-red-500">*</span>
        </label>
        <select
          {...form.register('employment_status')}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          aria-labelledby="employment-status-label"
        >
          {employmentStatusEnum.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Current Employee */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...form.register('is_current_employee')}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          id="current-employee"
        />
        <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="current-employee">
          I currently work here
        </label>
      </div>

      {/* Pros */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="pros-label">
          Pros <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">({prosLength}/1000)</span>
        </label>
        <textarea
          {...form.register('pros')}
          onChange={(e) => setProsLength(e.target.value.length)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          rows={4}
          placeholder="What do you like about working here?"
          maxLength={1000}
          aria-labelledby="pros-label"
        />
      </div>

      {/* Cons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" id="cons-label">
          Cons <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">({consLength}/1000)</span>
        </label>
        <textarea
          {...form.register('cons')}
          onChange={(e) => setConsLength(e.target.value.length)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          rows={4}
          placeholder="What do you dislike about working here?"
          maxLength={1000}
          aria-labelledby="cons-label"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        variant="default"
        size="lg"
        className="w-full"
        aria-label={isSubmitting ? "Submitting review..." : "Submit review"}
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" aria-hidden="true" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
}