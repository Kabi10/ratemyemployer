'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { companySchema, type CompanyFormData } from '@/lib/schemas';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Database } from '@/types/supabase';
import { Select } from '@/components/ui/select';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyFormProps {
  initialData?: Company;
  onSuccess?: () => void;
}

export function CompanyForm({ initialData, onSuccess }: CompanyFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Auth gate: show CTA instead of a dead form when not signed in
  if (!user) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="mb-2 font-medium">Please sign in to add a company.</p>
        <Link href="/auth/login?signup=true" className="underline underline-offset-2">
          Sign in / Create account
        </Link>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      industry: (initialData?.industry as any) || undefined,
      location: initialData?.location || '',
      website: initialData?.website || '',
    },
  });

  const location = watch('location');

  useEffect(() => {
    if (location && location.length > 0) {
      setLocationError(null);
    }
  }, [location]);

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) {
      setError('You must be logged in to add a company');
      return;
    }

    if (!data.location) {
      setLocationError('Please select a location');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session?.user) {
        setError('No active session found. Please log in again.');
        return;
      }

      // Create the company using the database helper
      const { error: createError } = await supabase
        .from('companies')
        .insert([{
          ...data,
          created_by: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (createError) {
        console.error('Error creating company:', {
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
          code: createError.code
        });
        setError(createError.message);
        return;
      }

      reset();
      router.refresh();
      onSuccess?.();
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <ErrorDisplay message={error} />}

      <div>
        <label className="block text-sm font-medium mb-2">Company Name</label>
        <Input {...register('name')} />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Industry</label>
        <Select
          value={watch('industry')}
          onValueChange={(value) => setValue('industry', value as "Technology" | "Healthcare" | "Education" | "Finance" | "Manufacturing" | "Retail" | "Other")}
        >
          {/* options */}
        </Select>
        {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('location')}
          placeholder="Enter location..."
          required
        />
        {locationError && <p className="mt-1 text-sm text-red-600">{locationError}</p>}
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Website</label>
        <Input {...register('website')} type="url" />
        {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner /> : initialData ? 'Update Company' : 'Add Company'}
      </Button>
    </form>
  );
}
