'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { companySchema, type CompanyFormData } from '@/lib/schemas';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Database } from '@/types/supabase';

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
      industry: initialData?.industry || '',
      location: initialData?.location || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
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

    setIsSubmitting(true);
    setError(null);
    setLocationError(null);

    try {
      const supabase = createClient();
      if (initialData?.id) {
        const { error: submitError } = await supabase
          .from('companies')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id);

        if (submitError) throw submitError;
      } else {
        const { error: submitError } = await supabase
          .from('companies')
          .insert({
            ...data,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (submitError) throw submitError;
      }

      reset();
      onSuccess?.();
      router.push('/companies');
    } catch (err) {
      console.error('Error submitting company:', err);
      setError('Failed to submit company. Please try again.');
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
        <select {...register('industry')} className="w-full p-3 border rounded-lg">
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
        {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <LocationAutocomplete
          value={location || ''}
          onChange={(value) => setValue('location', value)}
          className="w-full p-3 border rounded-lg"
          placeholder="Start typing a city name..."
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

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full p-3 border rounded-lg"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner /> : initialData ? 'Update Company' : 'Add Company'}
      </Button>
    </form>
  );
}