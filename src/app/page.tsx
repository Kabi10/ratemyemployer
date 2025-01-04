// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { X } from 'lucide-react';
import { Company } from '@/types';
import Link from 'next/link';
import { ReviewForm } from '@/components/ReviewForm';
import { useDebounce } from '@/hooks/useDebounce';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { INDUSTRIES } from '@/types';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  website: z.union([
    z.string().url('Please enter a valid URL'),
    z.string().length(0),
    z.null(),
  ]).optional(),
  industry: z.string().min(2, 'Industry must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      name: '',
      website: '',
      industry: '',
      location: '',
    }
  });

  const locationValue = watch('location');

  const searchCompanies = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `${trimmedQuery}%`)
        .order('name', { ascending: true })
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching companies:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Check if exact company name exists in results
  const hasExactMatch = searchResults.some(
    company => company.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  useEffect(() => {
    searchCompanies(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    try {
      // Clean the data before submission
      const cleanData = {
        name: data.name.trim(),
        website: data.website && data.website.length > 0 ? data.website : null,
        industry: data.industry,
        location: data.location,
      };

      console.log('Submitting data:', cleanData);
      
      const supabase = createClient();
      const { data: newCompany, error } = await supabase
        .from('companies')
        .insert([cleanData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('Created company:', newCompany);
      setSearchResults([newCompany, ...searchResults]);
      setShowAddCompany(false);
      reset();
    } catch (error) {
      console.error('Error creating company:', error instanceof Error ? error.message : 'Unknown error');
      alert(error instanceof Error ? error.message : 'Failed to create company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this effect to handle form reset when opening the add company form
  useEffect(() => {
    if (showAddCompany) {
      setValue('name', searchQuery.trim());
    }
  }, [showAddCompany, searchQuery, setValue]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Rate My Employer</span>
            <span className="block text-blue-600 dark:text-blue-400">
              Share Your Work Experience
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Join our community to share and discover authentic workplace experiences.
          </p>

          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for a company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-lg"
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <LoadingSpinner />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((company) => (
                  <div
                    key={company.id}
                    className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        {company.industry && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{company.industry}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowAddReview(true);
                        }}
                      >
                        Write Review
                      </Button>
                    </div>
                  </div>
                ))}

                {!hasExactMatch && searchQuery.trim() && (
                  <div className="mt-4">
                    <Button
                      onClick={() => setShowAddCompany(true)}
                      className="w-full"
                      variant="outline"
                    >
                      Add &quot;{searchQuery.trim()}&quot; as a new company
                    </Button>
                  </div>
                )}
              </div>
            )}

            {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
              <div className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">No companies found.</p>
                <Button
                  onClick={() => setShowAddCompany(true)}
                  className="mt-2"
                  variant="outline"
                >
                  Add &quot;{searchQuery.trim()}&quot; as a new company
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over panel for adding a new company */}
      {showAddCompany && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                          Add New Company
                        </h2>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowAddCompany(false)}
                        >
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Company Name
                          </label>
                          <Input
                            {...register('name')}
                            className="mt-1"
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Website (optional)
                          </label>
                          <Input 
                            {...register('website')}
                            className="mt-1"
                            placeholder="https://example.com"
                            type="url"
                          />
                          {errors.website && (
                            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Leave empty if unknown
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Industry
                          </label>
                          <Select
                            onValueChange={(value) => setValue('industry', value)}
                            defaultValue=""
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select an industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDUSTRIES.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.industry && (
                            <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Location
                          </label>
                          <LocationAutocomplete
                            value={locationValue || ''}
                            onChange={(value) => setValue('location', value)}
                            error={errors.location?.message}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? <LoadingSpinner /> : 'Add Company'}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over panel for adding a review */}
      {showAddReview && selectedCompany && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Write a Review
                          </h2>
                          <p className="mt-1 text-sm text-gray-500">{selectedCompany.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowAddReview(false);
                            setSelectedCompany(null);
                          }}
                        >
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="mt-6">
                        <ReviewForm
                          companyId={selectedCompany.id}
                          onSuccess={() => {
                            setShowAddReview(false);
                            setSelectedCompany(null);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
