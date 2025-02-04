'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import type { CompanyId, ReviewFormData, CompanyWithStats } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LoadingSpinner } from './ui/loading-spinner';
import { useToast } from './ui/use-toast';
import { StarIcon } from '@heroicons/react/24/solid';
import { z } from 'zod';
import { cn } from '@/lib/utils';

/**
 * src/components/ReviewForm.tsx
 * Review form component for creating and editing reviews
 */

// External imports

// Internal imports

const EMPLOYMENT_STATUSES = ['Full-time', 'Part-time', 'Contract', 'Intern'] as const;

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

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  rating: z.number().min(1).max(5),
  pros: z.string().min(1, 'Pros are required'),
  cons: z.string().min(1, 'Cons are required'),
  position: z.string().optional(),
  employment_status: z.enum(EMPLOYMENT_STATUSES).optional(),
  is_current_employee: z.boolean().optional(),
  reviewer_email: z.string().email().optional().or(z.literal('')),
  reviewer_name: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface ReviewFormProps {
  companyId: CompanyId;
  initialData?: Partial<FormData>;
  onSuccess?: () => void;
}

export function ReviewForm({ companyId, initialData, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      rating: initialData?.rating || 0,
      pros: initialData?.pros || '',
      cons: initialData?.cons || '',
      position: initialData?.position || '',
      employment_status: initialData?.employment_status,
      is_current_employee: initialData?.is_current_employee || false,
      reviewer_email: initialData?.reviewer_email || '',
      reviewer_name: initialData?.reviewer_name || '',
    }
  });

  const rating = watch('rating');
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
          setSelectedCompany(company as CompanyWithStats);
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

  const handleReviewSubmit = async (data: FormData) => {
    if (!user) {
      router.push('/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!companyId) {
      toast({
        title: "Error",
        description: "Company ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('reviews').insert({
        ...data,
        company_id: companyId,
        reviewer_id: user.id,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your review has been submitted successfully and is pending approval.",
      });
      
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to submit review',
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
    <form onSubmit={handleSubmit(handleReviewSubmit)} className="space-y-6">
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('rating', value)}
              className={cn(
                'p-1 rounded-md transition-colors',
                rating >= value ? 'text-yellow-400' : 'text-gray-300'
              )}
            >
              <StarIcon className="h-8 w-8" />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Review Title <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('title')}
          type="text"
          placeholder="Summarize your experience in a title"
          className="w-full"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Position
        </label>
        <Input
          {...register('position')}
          type="text"
          list="positions"
          placeholder="Your job title"
          className="w-full"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Employment Status
        </label>
        <Select
          onValueChange={(value) => setValue('employment_status', value as typeof EMPLOYMENT_STATUSES[number])}
          defaultValue={watch('employment_status')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select employment status" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.employment_status && (
          <p className="mt-1 text-sm text-red-600">{errors.employment_status.message}</p>
        )}
      </div>

      {/* Current Employee */}
      <div className="flex items-center">
        <input
          {...register('is_current_employee')}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pros <span className="text-red-500">*</span>
        </label>
        <Textarea
          {...register('pros')}
          rows={3}
          placeholder="What did you like about working here? (minimum 10 characters)"
          maxLength={1000}
        />
        {errors.pros && (
          <p className="mt-1 text-sm text-red-600">{errors.pros.message}</p>
        )}
        <div className="mt-1 text-sm text-gray-500">
          {1000 - (pros?.length || 0)} characters remaining
        </div>
      </div>

      {/* Cons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cons <span className="text-red-500">*</span>
        </label>
        <Textarea
          {...register('cons')}
          rows={3}
          placeholder="What could be improved? (minimum 10 characters)"
          maxLength={1000}
        />
        {errors.cons && (
          <p className="mt-1 text-sm text-red-600">{errors.cons.message}</p>
        )}
        <div className="mt-1 text-sm text-gray-500">
          {1000 - (cons?.length || 0)} characters remaining
        </div>
      </div>

      {/* Reviewer Info */}
      <div className="space-y-4">
        <div>
          <label htmlFor="reviewer_name" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <Input
            id="reviewer_name"
            {...register('reviewer_name')}
            className="mt-1"
            placeholder="Optional - will be displayed as 'Anonymous' if left blank"
          />
          {errors.reviewer_name && (
            <p className="mt-1 text-sm text-red-600">{errors.reviewer_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="reviewer_email" className="block text-sm font-medium text-gray-700">
            Your Email
          </label>
          <Input
            id="reviewer_email"
            type="email"
            {...register('reviewer_email')}
            className="mt-1"
            placeholder="Optional - will not be displayed publicly"
          />
          {errors.reviewer_email && (
            <p className="mt-1 text-sm text-red-600">{errors.reviewer_email.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
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
}