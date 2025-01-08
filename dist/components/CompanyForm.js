"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyForm = void 0;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const navigation_1 = require("next/navigation");
const zod_1 = require("@hookform/resolvers/zod");
const schemas_1 = require("@/lib/schemas");
const types_1 = require("@/types");
const supabaseClient_1 = require("@/lib/supabaseClient");
const AuthContext_1 = require("@/contexts/AuthContext");
const button_1 = require("./ui/button");
const input_1 = require("./ui/input");
const loading_spinner_1 = require("@/components/ui/loading-spinner");
const ErrorDisplay_1 = require("@/components/ErrorDisplay");
const LocationAutocomplete_1 = require("@/components/LocationAutocomplete");
function CompanyForm({ initialData, onSuccess }) {
    const router = (0, navigation_1.useRouter)();
    const { user } = (0, AuthContext_1.useAuth)();
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [locationError, setLocationError] = (0, react_1.useState)(null);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(schemas_1.companySchema),
        defaultValues: {
            name: (initialData === null || initialData === void 0 ? void 0 : initialData.name) || '',
            industry: (initialData === null || initialData === void 0 ? void 0 : initialData.industry) || types_1.INDUSTRIES[0],
            location: (initialData === null || initialData === void 0 ? void 0 : initialData.location) || '',
            website: (initialData === null || initialData === void 0 ? void 0 : initialData.website) || '',
            description: (initialData === null || initialData === void 0 ? void 0 : initialData.description) || '',
            size: (initialData === null || initialData === void 0 ? void 0 : initialData.size) || 'Small',
            logo_url: (initialData === null || initialData === void 0 ? void 0 : initialData.logo_url) || '',
        },
    });
    const location = watch('location');
    (0, react_1.useEffect)(() => {
        if (location && location.length > 0) {
            setLocationError(null);
        }
    }, [location]);
    const onSubmit = async (data) => {
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
            const supabase = (0, supabaseClient_1.createClient)();
            if (initialData === null || initialData === void 0 ? void 0 : initialData.id) {
                const { error: submitError } = await supabase
                    .from('companies')
                    .update(Object.assign(Object.assign({}, data), { updated_at: new Date().toISOString() }))
                    .eq('id', initialData.id);
                if (submitError)
                    throw submitError;
            }
            else {
                const { error: submitError } = await supabase
                    .from('companies')
                    .insert(Object.assign(Object.assign({}, data), { created_by: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
                if (submitError)
                    throw submitError;
            }
            reset();
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
            router.push('/companies');
        }
        catch (err) {
            console.error('Error submitting company:', err);
            setError('Failed to submit company. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <ErrorDisplay_1.ErrorDisplay message={error}/>}

      <div>
        <label className="block text-sm font-medium mb-2">Company Name</label>
        <input_1.Input {...register('name')}/>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Industry</label>
        <select {...register('industry')} className="w-full p-3 border rounded-lg">
          {types_1.INDUSTRIES.map((industry) => (<option key={industry} value={industry}>
              {industry}
            </option>))}
        </select>
        {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <LocationAutocomplete_1.LocationAutocomplete value={location || ''} onChange={(value) => setValue('location', value)} className="w-full p-3 border rounded-lg" placeholder="Start typing a city name..." required/>
        {locationError && <p className="mt-1 text-sm text-red-600">{locationError}</p>}
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Website</label>
        <input_1.Input {...register('website')} type="url"/>
        {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea {...register('description')} rows={3} className="w-full p-3 border rounded-lg"/>
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

      <button_1.Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <loading_spinner_1.LoadingSpinner /> : initialData ? 'Update Company' : 'Add Company'}
      </button_1.Button>
    </form>);
}
exports.CompanyForm = CompanyForm;
