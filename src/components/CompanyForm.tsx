'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Company } from '@/types';

interface CompanyFormProps {
  initialData?: Company;
  onSuccess?: () => void;
}

export function CompanyForm({ initialData, onSuccess }: CompanyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      location: initialData?.location || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
      ceo: initialData?.ceo || '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (initialData?.id) {
        // Update existing company
        const { error: updateError } = await supabase
          .from('companies')
          .update(data)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        // Create new company
        const { data: newCompany, error: insertError } = await supabase
          .from('companies')
          .insert([data])
          .select()
          .single();

        if (insertError) throw insertError;
        if (newCompany) {
          router.push(`/companies/${newCompany.id}`);
        }
      }

      reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error submitting company:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Company Name
        </label>
        <input
          {...register('name', { required: true })}
          type="text"
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">Company name is required</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Industry
        </label>
        <select
          {...register('industry', { required: true })}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Select Industry</option>
          <option value="Technology">Technology</option>
          <option value="Finance">Finance</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Retail">Retail</option>
          <option value="Manufacturing">Manufacturing</option>
        </select>
        {errors.industry && <p className="mt-1 text-sm text-red-600">Industry is required</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location
        </label>
        <input
          {...register('location', { required: true })}
          type="text"
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.location && <p className="mt-1 text-sm text-red-600">Location is required</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Website
        </label>
        <input
          {...register('website')}
          type="url"
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CEO Name
        </label>
        <input
          {...register('ceo')}
          type="text"
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : initialData ? 'Update Company' : 'Add Company'}
      </button>
    </form>
  );
}
