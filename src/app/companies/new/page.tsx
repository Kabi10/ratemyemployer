'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';

function formatUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

function validateUrl(url: string): boolean {
  if (!url) return true;
  try {
    new URL(formatUrl(url));
    return true;
  } catch {
    return false;
  }
}

function AddCompanyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suggestedName = searchParams.get('name') || '';

  const [formData, setFormData] = useState({
    name: suggestedName,
    industry: '',
    description: '',
    location: '',
    website: '',
    ceo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, website: value });
    if (value && !validateUrl(value)) {
      setUrlError('Please enter a valid website URL');
    } else {
      setUrlError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlError) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const websiteUrl = formData.website ? formatUrl(formData.website) : '';
      const { data, error: submitError } = await supabase
        .from('companies')
        .insert([
          {
            name: formData.name,
            industry: formData.industry,
            website: websiteUrl,
            ceo: formData.ceo,
            average_rating: 0,
            total_reviews: 0,
          },
        ])
        .select()
        .single();

      if (submitError) {
        console.error('Supabase error:', submitError);
        throw new Error(submitError.message || 'Failed to add company');
      }

      if (!data) {
        throw new Error('No data returned from Supabase');
      }

      router.push(`/companies/${data.id}`);
    } catch (err) {
      console.error('Full error object:', err);
      setError(err instanceof Error ? err.message : 'Failed to add company. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Add a New Company</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Industry <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.industry}
            onChange={e => setFormData({ ...formData, industry: e.target.value })}
            required
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Hospitality">Hospitality</option>
            <option value="Construction">Construction</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            rows={3}
            placeholder="Brief description of the company"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <LocationAutocomplete
            value={formData.location}
            onChange={value => setFormData({ ...formData, location: value })}
            required
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Company headquarters location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input
            type="text"
            value={formData.website}
            onChange={handleWebsiteChange}
            className={`w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 ${
              urlError ? 'border-red-500' : ''
            }`}
            placeholder="Google.com or https://Google.com"
          />
          {urlError && <p className="mt-0.5 text-xs text-red-500">{urlError}</p>}
          {formData.website && !urlError && (
            <p className="mt-0.5 text-xs text-gray-500">
              Will be saved as: {formatUrl(formData.website)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CEO</label>
          <input
            type="text"
            value={formData.ceo}
            onChange={e => setFormData({ ...formData, ceo: e.target.value })}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="Current CEO name"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-2 rounded text-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-red-700 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !!urlError}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {isSubmitting ? 'Adding Company...' : 'Add Company'}
        </button>
      </form>
    </div>
  );
}

export default function AddCompanyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddCompanyForm />
    </Suspense>
  );
}
