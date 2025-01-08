"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const withAuth_1 = require("@/lib/auth/withAuth");
const supabaseClient_1 = require("@/lib/supabaseClient");
const date_1 = require("@/utils/date");
function AdminReviewsPage() {
    const [reviews, setReviews] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        async function fetchReviews() {
            try {
                const { data, error: fetchError } = await supabaseClient_1.supabase
                    .from('reviews')
                    .select(`
            *,
            company:companies (
              id,
              name,
              industry,
              location
            )
          `)
                    .order('created_at', { ascending: false });
                if (fetchError) {
                    throw fetchError;
                }
                if (data) {
                    setReviews(data);
                }
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchReviews();
    }, []);
    const handleApproveReview = async (reviewId) => {
        try {
            const { error: updateError } = await supabaseClient_1.supabase
                .from('reviews')
                .update({ status: 'approved' })
                .eq('id', reviewId);
            if (updateError) {
                throw updateError;
            }
            setReviews(reviews.map(review => review.id === reviewId
                ? Object.assign(Object.assign({}, review), { status: 'approved' }) : review));
        }
        catch (err) {
            console.error('Error approving review:', err);
        }
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-red-600">Error: {error.message}</p>
          </div>
        </div>
        </div>);
    }
    return (<div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Review Management</h1>
          
          <div className="space-y-6">
            {reviews.map((review) => {
            var _a, _b, _c;
            return (<div key={review.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start">
              <div>
                    <h3 className="text-lg font-semibold">
                  {((_a = review.company) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Company'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {((_b = review.company) === null || _b === void 0 ? void 0 : _b.industry) || 'Industry not specified'} • 
                      {((_c = review.company) === null || _c === void 0 ? void 0 : _c.location) || 'Location not specified'}
                    </p>
                </div>
                  {review.status === 'pending' && (<button onClick={() => handleApproveReview(review.id)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                    Approve
                  </button>)}
              </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">{review.content || 'No content provided'}</p>
            </div>
                
                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <div>
                    Rating: <span className="font-medium">{review.rating || 'Not rated'}</span>
              </div>
              <div>
                    Posted on {(0, date_1.formatDateDisplay)(review.created_at)}
              </div>
            </div>
          </div>);
        })}
            
            {reviews.length === 0 && (<p className="text-center text-gray-600">No reviews found.</p>)}
          </div>
        </div>
      </div>
      </div>);
}
exports.default = (0, withAuth_1.withAuth)(AdminReviewsPage);
