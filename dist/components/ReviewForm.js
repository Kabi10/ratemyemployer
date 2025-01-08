"use strict";
/**
 * src/components/ReviewForm.tsx
 * Review form component for creating and editing reviews
 */
'use client';
/**
 * src/components/ReviewForm.tsx
 * Review form component for creating and editing reviews
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewForm = void 0;
// External imports
const zod_1 = require("@hookform/resolvers/zod");
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
// Internal imports
const AuthContext_1 = require("@/contexts/AuthContext");
const supabaseClient_1 = require("@/lib/supabaseClient");
const schemas_1 = require("@/lib/schemas");
const button_1 = require("./ui/button");
const input_1 = require("./ui/input");
const LoadingSpinner_1 = require("./LoadingSpinner");
const commonPositions = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'Marketing Manager',
    'Sales Representative',
    'Customer Support',
    'Human Resources',
    'Financial Analyst',
    'Project Manager',
    'Business Analyst',
    'Operations Manager',
    'Account Manager',
    'Quality Assurance',
    'DevOps Engineer'
];
function ReviewForm({ companyId, initialData, onSuccess }) {
    const { user } = (0, AuthContext_1.useAuth)();
    const router = (0, navigation_1.useRouter)();
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [selectedCompany, setSelectedCompany] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [prosLength, setProsLength] = (0, react_1.useState)(0);
    const [consLength, setConsLength] = (0, react_1.useState)(0);
    const defaultValues = {
        rating: (initialData === null || initialData === void 0 ? void 0 : initialData.rating) || 3,
        title: (initialData === null || initialData === void 0 ? void 0 : initialData.title) || '',
        position: (initialData === null || initialData === void 0 ? void 0 : initialData.position) || '',
        employment_status: ((initialData === null || initialData === void 0 ? void 0 : initialData.employment_status) || 'Full-time'),
        is_current_employee: (initialData === null || initialData === void 0 ? void 0 : initialData.is_current_employee) || false,
        status: (initialData === null || initialData === void 0 ? void 0 : initialData.status) || 'pending',
        pros: (initialData === null || initialData === void 0 ? void 0 : initialData.pros) || '',
        cons: (initialData === null || initialData === void 0 ? void 0 : initialData.cons) || ''
    };
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(schemas_1.reviewSchema),
        defaultValues,
    });
    const rating = form.watch('rating');
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        const fetchCompanyData = async () => {
            if (!companyId) {
                setIsLoading(false);
                return;
            }
            try {
                const supabase = (0, supabaseClient_1.createClient)();
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', companyId)
                    .single();
                if (error)
                    throw error;
                if (isMounted && data) {
                    setSelectedCompany(data);
                }
            }
            catch (err) {
                console.error('Error fetching company:', err);
                setError('Failed to load company data');
            }
            finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        fetchCompanyData();
        return () => {
            isMounted = false;
        };
    }, [companyId]);
    const onSubmit = async (data) => {
        if (!user) {
            router.push('/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname));
            return;
        }
        const company_id = (selectedCompany === null || selectedCompany === void 0 ? void 0 : selectedCompany.id) || (typeof companyId === 'string' ? parseInt(companyId, 10) : companyId);
        if (!company_id) {
            setError('Please select a company');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const supabase = (0, supabaseClient_1.createClient)();
            // Generate title from pros/cons
            const firstPro = data.pros.split('.')[0].trim();
            const firstCon = data.cons.split('.')[0].trim();
            const generatedTitle = `${firstPro.substring(0, 50)}... but ${firstCon.substring(0, 50)}...`;
            if (initialData === null || initialData === void 0 ? void 0 : initialData.id) {
                // Update existing review
                const { data: existingReview, error: checkError } = await supabase
                    .from('reviews')
                    .select('id, user_id')
                    .eq('id', initialData.id)
                    .single();
                if (checkError) {
                    console.error('Error checking existing review:', checkError);
                    throw new Error('Failed to verify review ownership');
                }
                if ((existingReview === null || existingReview === void 0 ? void 0 : existingReview.user_id) !== user.id) {
                    throw new Error('You can only edit your own reviews');
                }
                const updateData = {
                    rating: data.rating,
                    title: generatedTitle,
                    position: data.position,
                    employment_status: data.employment_status,
                    is_current_employee: data.is_current_employee,
                    status: data.status,
                    pros: data.pros,
                    cons: data.cons
                };
                const { error: updateError } = await supabase
                    .from('reviews')
                    .update(updateData)
                    .eq('id', initialData.id);
                if (updateError) {
                    console.error('Error updating review:', updateError);
                    throw updateError;
                }
            }
            else {
                // Create new review
                const { error: createError } = await supabase
                    .from('reviews')
                    .insert([
                    {
                        rating: data.rating,
                        title: generatedTitle,
                        position: data.position,
                        employment_status: data.employment_status,
                        is_current_employee: data.is_current_employee,
                        status: data.status,
                        company_id,
                        user_id: user.id,
                        pros: data.pros,
                        cons: data.cons
                    }
                ]);
                if (createError) {
                    console.error('Error creating review:', createError);
                    throw createError;
                }
            }
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        }
        catch (err) {
            console.error('Error submitting review:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit review');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading) {
        return (<div className="flex justify-center items-center min-h-[400px]" role="status" aria-label="Loading form...">
        <LoadingSpinner_1.LoadingSpinner size="lg"/>
      </div>);
    }
    return (<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Rating */}
      <div>
        <div role="group" aria-label="Rating">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Overall Rating</label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (<button key={value} type="button" className={`p-2 text-2xl transition-all duration-150 ${Number(rating) >= value
                ? 'text-yellow-400 hover:text-yellow-500 transform hover:scale-110'
                : 'text-gray-300 hover:text-yellow-400 transform hover:scale-110'}`} onClick={() => {
                form.setValue('rating', value, { shouldValidate: true });
            }} onMouseEnter={() => {
                const stars = document.querySelectorAll('.rating-star');
                stars.forEach((star, index) => {
                    if (index < value) {
                        star.classList.add('text-yellow-400');
                    }
                });
            }} onMouseLeave={() => {
                const stars = document.querySelectorAll('.rating-star');
                stars.forEach((star, index) => {
                    if (index >= Number(rating)) {
                        star.classList.remove('text-yellow-400');
                    }
                });
            }} aria-label={`Rate ${value} stars`} aria-pressed={Number(rating) >= value}>
                  <span className="rating-star">★</span>
                </button>))}
            </div>
            <span className="text-sm text-gray-500">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          </div>
          <input type="hidden" id="rating" {...form.register('rating', { valueAsNumber: true })}/>
          {form.formState.errors.rating && (<p className="mt-1 text-sm text-red-600" role="alert">{form.formState.errors.rating.message}</p>)}
        </div>
      </div>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="pros" className="block text-sm font-medium text-green-600 dark:text-green-400">
              Pros
            </label>
            <span className={`text-xs ${prosLength > 500 ? 'text-red-500' : 'text-gray-500'}`}>
              {prosLength}/500
            </span>
          </div>
          <textarea id="pros" {...form.register('pros', {
        onChange: (e) => setProsLength(e.target.value.length)
    })} rows={6} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" placeholder="What did you like about working here? (Required)" aria-invalid={form.formState.errors.pros ? 'true' : 'false'}/>
          {form.formState.errors.pros && (<p className="mt-1 text-sm text-red-600" role="alert">{form.formState.errors.pros.message}</p>)}
        </div>

        {/* Cons */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="cons" className="block text-sm font-medium text-red-600 dark:text-red-400">
              Cons
            </label>
            <span className={`text-xs ${consLength > 500 ? 'text-red-500' : 'text-gray-500'}`}>
              {consLength}/500
            </span>
          </div>
          <textarea id="cons" {...form.register('cons', {
        onChange: (e) => setConsLength(e.target.value.length)
    })} rows={6} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" placeholder="What could be improved? (Required)" aria-invalid={form.formState.errors.cons ? 'true' : 'false'}/>
          {form.formState.errors.cons && (<p className="mt-1 text-sm text-red-600" role="alert">{form.formState.errors.cons.message}</p>)}
        </div>
      </div>

      {/* Position */}
      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
        <div className="relative">
          <input_1.Input id="position" list="position-suggestions" {...form.register('position')} placeholder="e.g., Software Engineer" className="w-full pr-10" aria-invalid={form.formState.errors.position ? 'true' : 'false'}/>
          <datalist id="position-suggestions">
            {commonPositions.map((position) => (<option key={position} value={position}/>))}
          </datalist>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
        {form.formState.errors.position && (<p className="mt-1 text-sm text-red-600" role="alert">{form.formState.errors.position.message}</p>)}
      </div>

      {/* Employment Status */}
      <div>
        <label htmlFor="employment_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment Status</label>
        <select id="employment_status" {...form.register('employment_status')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" aria-invalid={form.formState.errors.employment_status ? 'true' : 'false'}>
          {schemas_1.employmentStatusEnum.map((status) => (<option key={status} value={status}>{status}</option>))}
        </select>
        {form.formState.errors.employment_status && (<p className="mt-1 text-sm text-red-600" role="alert">{form.formState.errors.employment_status.message}</p>)}
      </div>

      {/* Current Employee */}
      <div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" {...form.register('is_current_employee')} className="rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-blue-600 focus:ring-blue-500"/>
          <span className="text-sm text-gray-700 dark:text-gray-300">I currently work here</span>
        </label>
      </div>

      {error && (<div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200" role="alert">{error}</p>
            </div>
          </div>
        </div>)}

      <div className="flex justify-end">
        <button_1.Button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
          {isSubmitting ? (<>
              <LoadingSpinner_1.LoadingSpinner size="sm" className="mr-2"/>
              Submitting...
            </>) : ('Submit Review')}
        </button_1.Button>
      </div>
    </form>);
}
exports.ReviewForm = ReviewForm;
