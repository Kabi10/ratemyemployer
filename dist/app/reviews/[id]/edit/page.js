"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const supabaseClient_1 = require("@/lib/supabaseClient");
const ReviewForm_1 = require("@/components/ReviewForm");
function EditReview() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const [review, setReview] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchReview = (0, react_1.useCallback)(async () => {
        if (!params.id)
            return;
        try {
            const { data, error } = await supabaseClient_1.supabase
                .from('reviews')
                .select('*')
                .eq('id', params.id)
                .single();
            if (error)
                throw error;
            setReview(data);
        }
        catch (err) {
            console.error('Error fetching review:', err);
            setError('Failed to load review');
        }
        finally {
            setLoading(false);
        }
    }, [params.id]);
    (0, react_1.useEffect)(() => {
        fetchReview();
    }, [fetchReview]);
    if (loading) {
        return (<div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>);
    }
    if (error || !review) {
        return (<div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-200">{error || 'Review not found'}</p>
        </div>
      </div>);
    }
    return (<div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Review</h1>
      <ReviewForm_1.ReviewForm companyId={review.company_id} initialData={review} onSuccess={() => {
            router.push('/account');
        }}/>
    </div>);
}
exports.default = EditReview;
