// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabaseClient';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="text-center space-y-12 sm:space-y-16 md:space-y-20">
          <div className="space-y-6 sm:space-y-8">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight font-extrabold">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 leading-tight opacity-0 animate-fade-in-up [animation-delay:200ms]">
                Rate My Employer
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl mt-4 sm:mt-6 text-gray-600 dark:text-gray-300 opacity-0 animate-fade-in [animation-delay:400ms]">
                Share Your Work Experience
              </span>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 dark:text-gray-300 opacity-0 animate-fade-in [animation-delay:600ms]">
              Help others make informed career decisions.
            </p>
          </div>

          <div className="max-w-2xl mx-auto opacity-0 animate-fade-in [animation-delay:800ms]">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for a company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-8 py-6 text-xl rounded-2xl shadow-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              />
              {isSearching && (
                <div className="absolute right-6 top-6">
                  <LoadingSpinner />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-8 space-y-4">
                {searchResults.map((company) => (
                  <div
                    key={company.id}
                    className="block p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{company.name}</h3>
                        {company.industry && (
                          <p className="text-base text-gray-600 dark:text-gray-300 mt-2">{company.industry}</p>
                        )}
                      </div>
                      <Button
                        variant="default"
                        size="lg"
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowAddReview(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm text-lg px-6"
                      >
                        Write Review
                      </Button>
                    </div>
                  </div>
                ))}

                {!hasExactMatch && searchQuery.trim() && (
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowAddCompany(true)}
                      className="w-full py-8 text-xl font-medium rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-300"
                    >
                      Add &quot;{searchQuery.trim()}&quot; as a new company
                    </Button>
                  </div>
                )}
              </div>
            )}

            {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
              <div className="mt-12 text-center space-y-6">
                <p className="text-xl text-gray-600 dark:text-gray-400">No companies found matching your search.</p>
                <Button
                  onClick={() => setShowAddCompany(true)}
                  className="py-8 px-10 text-xl font-medium rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-300"
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
                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            placeholder="Enter a location"
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

      <div className="flex gap-4 justify-center mt-8">
        <Link
          href="/background-check"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
        >
          Try Background Check
        </Link>
      </div>
    </div>
  );
}
