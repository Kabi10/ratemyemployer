"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const supabaseClient_1 = require("@/lib/supabaseClient");
const LoadingSpinner_1 = require("@/components/LoadingSpinner");
const link_1 = __importDefault(require("next/link"));
const ErrorBoundary_1 = require("@/components/ErrorBoundary");
const ErrorDisplay_1 = require("@/components/ErrorDisplay");
function ReviewsList() {
    const [reviews, setReviews] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        async function fetchReviews() {
            try {
                const supabase = (0, supabaseClient_1.createClient)();
                const { data, error } = await supabase
                    .from('reviews')
                    .select(`
            id,
            rating,
            title,
            content,
            pros,
            cons,
            status,
            position,
            employment_status,
            created_at,
            user_id,
            company:companies (
              id,
              name
            )
          `)
                    .order('created_at', { ascending: false })
                    .returns();
                if (error)
                    throw error;
                setReviews(data || []);
            }
            catch (err) {
                console.error('Error fetching reviews:', err);
                setError('Failed to load reviews');
            }
            finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner_1.LoadingSpinner size="lg"/>
      </div>);
    }
    if (error) {
        return <ErrorDisplay_1.ErrorDisplay message={error}/>;
    }
    return (<div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recent Reviews</h1>
        <link_1.default href="/reviews/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          Write a Review
        </link_1.default>
      </div>

      <div className="space-y-6">
        {reviews.map(review => (<div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <link_1.default href={`/companies/${review.company.id}`} className="text-xl font-semibold hover:text-blue-500">
                  {review.company.name}
                </link_1.default>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {review.position} • {review.employment_status}
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold">{review.rating}/5</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-1">Pros</h4>
                <p className="text-gray-600 dark:text-gray-400">{review.pros || 'None provided'}</p>
              </div>
              <div>
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">Cons</h4>
                <p className="text-gray-600 dark:text-gray-400">{review.cons || 'None provided'}</p>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Posted on {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>))}
      </div>
    </div>);
}
function ReviewsPage() {
    return (<ErrorBoundary_1.ErrorBoundary>
      <ReviewsList />
    </ErrorBoundary_1.ErrorBoundary>);
}
exports.default = ReviewsPage;
