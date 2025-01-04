'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema, type CompanyFormData } from '@/lib/schemas';
import { Company, INDUSTRIES } from '@/types';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Script from 'next/script';

declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
  }
}

interface CompanyFormProps {
  initialData?: Company;
  onSuccess?: () => void;
}

export function CompanyForm({ initialData, onSuccess }: CompanyFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || INDUSTRIES[0],
      location: initialData?.location || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
      size: initialData?.size || 'Small',
      logo_url: initialData?.logo_url || '',
    },
  });

  useEffect(() => {
    if (isMapScriptLoaded) {
      console.log('Google Maps script loaded, initializing autocomplete...');
      const input = document.getElementById('location-input') as HTMLInputElement;
      if (!input) {
        console.error('Location input element not found');
        return;
      }

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ['(cities)'],
          fields: ['formatted_address', 'geometry']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          console.log('Selected place:', place);
          if (place.formatted_address) {
            setValue('location', place.formatted_address);
          }
        });
      } catch (error) {
        console.error('Error initializing Google Maps autocomplete:', error);
      }
    }
  }, [isMapScriptLoaded, setValue]);

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) {
      router.push('/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('companies')
          .update({ 
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', initialData.id);
        if (updateError) throw updateError;
      } else {
        const { data: newCompany, error: insertError } = await supabase
          .from('companies')
          .insert([{ 
            ...data, 
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
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
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => {
          console.log('Google Maps script tag loaded');
          setIsMapScriptLoaded(true);
        }}
        onError={(e) => {
          console.error('Error loading Google Maps script:', e);
          setError('Failed to load location search. Please enter location manually.');
        }}
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

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
        <label className="block text-sm font-medium mb-2">Location</label>
        <Input
          id="location-input"
          {...register('location')}
          placeholder="Start typing a city name..."
        />
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

      <div>
        <label className="block text-sm font-medium mb-2">Company Size</label>
        <select {...register('size')} className="w-full p-3 border rounded-lg">
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        {errors.size && <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Logo URL</label>
        <Input {...register('logo_url')} type="url" />
        {errors.logo_url && <p className="mt-1 text-sm text-red-600">{errors.logo_url.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Submitting...
          </>
        ) : (
          initialData ? 'Update Company' : 'Add Company'
        )}
      </Button>
    </form>
  );
}
