// src/components/CreateReview.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from './LoadingSpinner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Company, Review } from '@/types';

interface CreateReviewProps {
  companyId?: string;
  initialData?: Review;
  onSuccess?: () => void;
}

const reviewSchema = z.object({
  content: z
    .string()
    .min(20, 'Content must be at least 20 characters')
    .max(2000, 'Content must be less than 2000 characters'),
  rating: z.number().min(1).max(5),
  pros: z
    .string()
    .min(10, 'Pros must be at least 10 characters')
    .max(1000, 'Pros must be less than 1000 characters'),
  cons: z
    .string()
    .min(10, 'Cons must be at least 10 characters')
    .max(1000, 'Cons must be less than 1000 characters'),
  position: z.string().min(1, 'Position is required'),
  employment_status: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  status: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export function CreateReview({ companyId, initialData, onSuccess }: CreateReviewProps) {
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
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialData?.rating || 3,
      content: initialData?.content || '',
      pros: initialData?.pros || '',
      cons: initialData?.cons || '',
      position: initialData?.position || '',
      employment_status:
        (initialData?.employment_status as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN') ||
        'FULL_TIME',
      status: initialData?.status,
    },
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCompanyData = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
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
      setError('You must be logged in to submit a review');
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
      const reviewData = {
        ...data,
        company_id,
        user_id: user.id,
        title: '',
      };

      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('reviews').insert([reviewData]);

        if (insertError) throw insertError;
      }

      reset();
      if (onSuccess) onSuccess();
      router.push(`/companies/${company_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
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
      <div className="space-y-2">
        <label className="block text-sm font-medium">Content</label>
        <textarea
          {...register('content')}
          rows={4}
          className="w-full p-3 border rounded-lg"
          placeholder="Overall review content"
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Rating</label>
        <Input type="number" {...register('rating', { valueAsNumber: true })} min="1" max="5" />
        {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Employment Status</label>
        <select
          {...register('employment_status')}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERN">Intern</option>
        </select>
        {errors.employment_status && (
          <p className="text-sm text-red-500">{errors.employment_status.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Position</label>
        <Input {...register('position')} placeholder="Your position at the company" />
        {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Pros</label>
        <textarea
          {...register('pros')}
          rows={3}
          className="w-full p-3 border rounded-lg"
          placeholder="What did you like about working here?"
        />
        {errors.pros && <p className="text-sm text-red-500">{errors.pros.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Cons</label>
        <textarea
          {...register('cons')}
          rows={3}
          className="w-full p-3 border rounded-lg"
          placeholder="What could be improved?"
        />
        {errors.cons && <p className="text-sm text-red-500">{errors.cons.message}</p>}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
}
