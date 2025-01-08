"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
exports.dynamic = 'force-dynamic';
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const supabaseClient_1 = require("@/lib/supabaseClient");
const ErrorDisplay_1 = require("@/components/ErrorDisplay");
function EditCompany() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const [company, setCompany] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        industry: '',
        description: '',
        location: '',
        website: '',
        ceo: '',
    });
    (0, react_1.useEffect)(() => {
        if (params.id && typeof params.id === 'string') {
            fetchCompany(params.id);
        }
    }, [params.id]);
    const fetchCompany = async (id) => {
        try {
            const { data, error } = await supabaseClient_1.supabase.from('companies').select('*').eq('id', id).single();
            if (error)
                throw error;
            setCompany(data);
            setFormData({
                name: data.name,
                industry: data.industry,
                description: data.description || '',
                location: data.location,
                website: data.website || '',
                ceo: data.ceo || '',
            });
        }
        catch (err) {
            console.error('Error fetching company:', err);
            setError('Failed to load company');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!params.id || typeof params.id !== 'string')
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            const { error } = await supabaseClient_1.supabase.from('companies').update(formData).eq('id', params.id);
            if (error)
                throw error;
            router.push(`/companies/${params.id}`);
        }
        catch (err) {
            console.error('Error updating company:', err);
            setError(err instanceof Error ? err.message : 'Failed to update company');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (loading) {
        return (<div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>);
    }
    if (error || !company) {
        return (<div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-200">{error || 'Company not found'}</p>
        </div>
      </div>);
    }
    return (<div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Company</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input type="text" value={formData.name} onChange={e => setFormData(Object.assign(Object.assign({}, formData), { name: e.target.value }))} required className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"/>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Industry <span className="text-red-500">*</span>
          </label>
          <select value={formData.industry} onChange={e => setFormData(Object.assign(Object.assign({}, formData), { industry: e.target.value }))} required className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
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
          <textarea value={formData.description} onChange={e => setFormData(Object.assign(Object.assign({}, formData), { description: e.target.value }))} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" rows={3}/>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input type="text" value={formData.location} onChange={e => setFormData(Object.assign(Object.assign({}, formData), { location: e.target.value }))} required className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Company headquarters location"/>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input type="url" value={formData.website} onChange={e => setFormData(Object.assign(Object.assign({}, formData), { website: e.target.value }))} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="https://example.com"/>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CEO</label>
          <input type="text" value={formData.ceo} onChange={e => setFormData(Object.assign(Object.assign({}, formData), { ceo: e.target.value }))} className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Company CEO name"/>
        </div>

        {error && <ErrorDisplay_1.ErrorDisplay message={error} className="mb-4"/>}

        <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>);
}
exports.default = EditCompany;
