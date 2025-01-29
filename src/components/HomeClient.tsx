'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';

import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { INDUSTRIES, type Industry } from '@/types';
import { companySchema, type CompanyFormData, type ReviewFormData } from '@/lib/schemas';
import type { Database } from '@/types/supabase';
import { Review } from '@/types/review';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { ReviewForm } from '@/components/ReviewForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCompany, getReviews } from '@/lib/database';

type Company = Database['public']['Tables']['companies']['Row'];

export function HomeClient() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

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
      industry: undefined,
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
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `%${trimmedQuery}%`)
        .order('name', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error searching companies:', error);
        setSearchResults([]);
        return;
      }
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching companies:', error);
      setSearchResults([]);
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

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          company:company_id(*)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }
      setReviews(data || []);
    };
    fetchReviews();
  }, []);

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) {
      setShowAddCompany(false);
      router.push('/auth');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanData = {
        name: data.name.trim(),
        website: data.website && data.website.length > 0 ? data.website : null,
        industry: data.industry as Industry,
        location: data.location,
      };

      console.log('Submitting data:', cleanData, 'User:', user);
      
      const { data: newCompany, error } = await createCompany(cleanData);

      if (error) {
        console.error('Error creating company:', error);
        if (error.message.includes('authenticated')) {
          setShowAddCompany(false);
          router.push('/auth');
          return;
        }
        throw error;
      }

      await searchCompanies(cleanData.name);
      setShowAddCompany(false);
      reset();
    } catch (error) {
      console.error('Error creating company:', error instanceof Error ? error.message : 'Unknown error');
      alert(error instanceof Error ? error.message : 'Failed to create company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showAddCompany) {
      setValue('name', searchQuery.trim());
    }
  }, [showAddCompany, searchQuery, setValue]);

  const filteredCompanies = searchResults.filter((company: Company) => 
    company.industry && INDUSTRIES.includes(company.industry as typeof INDUSTRIES[number])
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="max-w-2xl mx-auto opacity-0 animate-fade-in [animation-delay:800ms]">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a company..."
          value={searchQuery}
          onChange={handleSearchChange}
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
          {filteredCompanies.map((company) => (
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
                    if (!user) {
                      router.push('/auth');
                      return;
                    }
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
                onClick={() => {
                  if (!user) {
                    router.push('/auth');
                    return;
                  }
                  setShowAddCompany(true);
                }}
                className="w-full py-8 text-xl font-medium rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-300"
                disabled={authLoading}
              >
                {authLoading ? (
                  <LoadingSpinner />
                ) : user ? (
                  `Add "${searchQuery.trim()}" as a new company`
                ) : (
                  'Sign in to add a company'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
        <div className="mt-12 text-center space-y-6">
          <p className="text-xl text-gray-600 dark:text-gray-400">No companies found matching your search.</p>
          <Button
            onClick={() => {
              if (!user) {
                router.push('/auth');
                return;
              }
              setShowAddCompany(true);
            }}
            className="py-8 px-10 text-xl font-medium rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-300"
          >
            {user ? `Add "${searchQuery.trim()}" as a new company` : 'Sign in to add a company'}
          </Button>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddReview && selectedCompany && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowAddReview(false)}
            />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex animate-slide-in-right">
              <div className="relative w-screen max-w-2xl">
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Write a Review
                          </h2>
                          <p className="mt-1 text-sm text-gray-500">
                            for {selectedCompany.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowAddReview(false)}
                        >
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="mt-6">
                        <ReviewForm
                          companyId={selectedCompany.id}
                          onSuccess={() => {
                            setShowAddReview(false);
                            router.refresh();
                          }}
                          onSubmit={async (data) => {
                            try {
                              const { error } = await supabase
                                .from('reviews')
                                .insert({ ...data, company_id: selectedCompany.id });
                              
                              if (error) throw error;
                              return Promise.resolve();
                            } catch (error) {
                              return Promise.reject(error);
                            }
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

      {/* Add Company Modal */}
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
                            onValueChange={(value: Industry) => setValue('industry', value)}
                            defaultValue={undefined}
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
    </div>
  );
} 