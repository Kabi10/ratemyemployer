"use strict";
// app/page.tsx
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const z = __importStar(require("zod"));
const supabaseClient_1 = require("@/lib/supabaseClient");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const LoadingSpinner_1 = require("@/components/LoadingSpinner");
const lucide_react_1 = require("lucide-react");
const ReviewForm_1 = require("@/components/ReviewForm");
const useDebounce_1 = require("@/hooks/useDebounce");
const select_1 = require("@/components/ui/select");
const LocationAutocomplete_1 = require("@/components/LocationAutocomplete");
const types_1 = require("@/types");
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
function Home() {
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const debouncedSearchQuery = (0, useDebounce_1.useDebounce)(searchQuery, 300);
    const [searchResults, setSearchResults] = (0, react_1.useState)([]);
    const [isSearching, setIsSearching] = (0, react_1.useState)(false);
    const [showAddCompany, setShowAddCompany] = (0, react_1.useState)(false);
    const [showAddReview, setShowAddReview] = (0, react_1.useState)(false);
    const [selectedCompany, setSelectedCompany] = (0, react_1.useState)(null);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(companySchema),
        defaultValues: {
            name: '',
            website: '',
            industry: '',
            location: '',
        }
    });
    const locationValue = watch('location');
    const searchCompanies = async (query) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const supabase = (0, supabaseClient_1.createClient)();
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .ilike('name', `${trimmedQuery}%`)
                .order('name', { ascending: true })
                .limit(5);
            if (error)
                throw error;
            setSearchResults(data || []);
        }
        catch (error) {
            console.error('Error searching companies:', error);
        }
        finally {
            setIsSearching(false);
        }
    };
    // Check if exact company name exists in results
    const hasExactMatch = searchResults.some(company => company.name.toLowerCase() === searchQuery.trim().toLowerCase());
    (0, react_1.useEffect)(() => {
        searchCompanies(debouncedSearchQuery);
    }, [debouncedSearchQuery]);
    const onSubmit = async (data) => {
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
            const supabase = (0, supabaseClient_1.createClient)();
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
        }
        catch (error) {
            console.error('Error creating company:', error instanceof Error ? error.message : 'Unknown error');
            alert(error instanceof Error ? error.message : 'Failed to create company. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // Add this effect to handle form reset when opening the add company form
    (0, react_1.useEffect)(() => {
        if (showAddCompany) {
            setValue('name', searchQuery.trim());
        }
    }, [showAddCompany, searchQuery, setValue]);
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
              <input_1.Input type="text" placeholder="Search for a company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-8 py-6 text-xl rounded-2xl shadow-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"/>
              {isSearching && (<div className="absolute right-6 top-6">
                  <LoadingSpinner_1.LoadingSpinner />
                </div>)}
            </div>

            {searchResults.length > 0 && (<div className="mt-8 space-y-4">
                {searchResults.map((company) => (<div key={company.id} className="block p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{company.name}</h3>
                        {company.industry && (<p className="text-base text-gray-600 dark:text-gray-300 mt-2">{company.industry}</p>)}
                      </div>
                      <button_1.Button variant="default" size="lg" onClick={() => {
                    setSelectedCompany(company);
                    setShowAddReview(true);
                }} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm text-lg px-6">
                        Write Review
                      </button_1.Button>
                    </div>
                  </div>))}

                {!hasExactMatch && searchQuery.trim() && (<div className="mt-6">
                    <button_1.Button onClick={() => setShowAddCompany(true)} className="w-full py-8 text-xl font-medium rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-300">
                      Add &quot;{searchQuery.trim()}&quot; as a new company
                    </button_1.Button>
                  </div>)}
              </div>)}

            {searchQuery.trim() && !isSearching && searchResults.length === 0 && (<div className="mt-12 text-center space-y-6">
                <p className="text-xl text-gray-600 dark:text-gray-400">No companies found matching your search.</p>
                <button_1.Button onClick={() => setShowAddCompany(true)} className="py-8 px-10 text-xl font-medium rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-300">
                  Add &quot;{searchQuery.trim()}&quot; as a new company
                </button_1.Button>
              </div>)}
          </div>
        </div>
      </div>

      {/* Slide-over panel for adding a new company */}
      {showAddCompany && (<div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                          Add New Company
                        </h2>
                        <button_1.Button variant="ghost" size="icon" onClick={() => setShowAddCompany(false)}>
                          <lucide_react_1.X className="h-6 w-6"/>
                        </button_1.Button>
                      </div>
                      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Company Name
                          </label>
                          <input_1.Input {...register('name')} className="mt-1"/>
                          {errors.name && (<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>)}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Website (optional)
                          </label>
                          <input_1.Input {...register('website')} className="mt-1" placeholder="https://example.com" type="url"/>
                          {errors.website && (<p className="mt-1 text-sm text-red-600">{errors.website.message}</p>)}
                          <p className="mt-1 text-xs text-gray-500">
                            Leave empty if unknown
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Industry
                          </label>
                          <select_1.Select onValueChange={(value) => setValue('industry', value)} defaultValue="">
                            <select_1.SelectTrigger className="mt-1">
                              <select_1.SelectValue placeholder="Select an industry"/>
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                              {types_1.INDUSTRIES.map((industry) => (<select_1.SelectItem key={industry} value={industry}>
                                  {industry}
                                </select_1.SelectItem>))}
                            </select_1.SelectContent>
                          </select_1.Select>
                          {errors.industry && (<p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>)}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Location
                          </label>
                          <LocationAutocomplete_1.LocationAutocomplete value={locationValue || ''} onChange={(value) => setValue('location', value)} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Enter a location"/>
                        </div>
                        <button_1.Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? <LoadingSpinner_1.LoadingSpinner /> : 'Add Company'}
                        </button_1.Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>)}

      {/* Slide-over panel for adding a review */}
      {showAddReview && selectedCompany && (<div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
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
                        <button_1.Button variant="ghost" size="icon" onClick={() => {
                setShowAddReview(false);
                setSelectedCompany(null);
            }}>
                          <lucide_react_1.X className="h-6 w-6"/>
                        </button_1.Button>
                      </div>
                      <div className="mt-6">
                        <ReviewForm_1.ReviewForm companyId={selectedCompany.id} onSuccess={() => {
                setShowAddReview(false);
                setSelectedCompany(null);
            }}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>)}
    </div>);
}
exports.default = Home;
