'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ErrorDisplay } from "@/components/ErrorDisplay";
import type { Database } from '@/types/supabase';

type Company = Database['public']['Tables']['companies']['Row'] & {
  metadata?: {
    ceo?: string;
    // Add other metadata fields as needed
  };
};

export const dynamic = 'force-dynamic';

export default function EditCompany() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    location: '',
    website: '',
    metadata: undefined as Record<string, any> | undefined
  });

  useEffect(() => {
    const id = params?.id;
    if (id && typeof id === 'string') {
      fetchCompany(id);
    }
  }, [params?.id]);

  const fetchCompany = async (id: string) => {
    try {
      const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();

      if (error) throw error;

      if (data) {
        setCompany(data);
        const formValues = {
          name: data.name || '',
          industry: data.industry || '',
          description: data.description || '',
          location: data.location || '',
          website: data.website || '',
          metadata: undefined as Record<string, any> | undefined
        };
        
        if (data.metadata) {
          setFormData({
            ...formValues,
            metadata: data.metadata
          });
        } else {
          setFormData(formValues);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = params?.id;
    if (!id || typeof id !== 'string') return;

    setIsSubmitting(true);
    setError(null);

    try {
      const dataToUpdate = { ...formData };
      if (dataToUpdate.metadata === undefined) {
        delete dataToUpdate.metadata;
      }

      const { error } = await supabase
        .from('companies')
        .update(dataToUpdate)
        .eq('id', id);

      if (error) throw error;

      router.push(`/companies/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!params?.id) return <div>Invalid company ID</div>;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Company</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Industry
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}