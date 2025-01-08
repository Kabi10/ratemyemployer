"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const supabaseClient_1 = require("@/lib/supabaseClient");
const LoadingSpinner_1 = require("@/components/LoadingSpinner");
const AdminLayout_1 = require("@/components/layouts/AdminLayout");
const recharts_1 = require("recharts");
function formatDate(dateString) {
    if (!dateString)
        return 'Date not available';
    return new Date(dateString).toLocaleDateString();
}
function calculateAverageRating(reviews) {
    const validReviews = reviews.filter((review) => typeof review.rating === 'number');
    if (validReviews.length === 0)
        return 0;
    return validReviews.reduce((acc, curr) => acc + curr.rating, 0) / validReviews.length;
}
function isValidReview(review) {
    return typeof review.rating === 'number' && typeof review.created_at === 'string';
}
function processMonthlyData(reviews) {
    const monthlyData = {};
    reviews
        .filter((review) => typeof review.rating === 'number' && review.created_at !== null)
        .forEach(review => {
        const month = new Date(review.created_at).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
        });
        if (monthlyData[month]) {
            monthlyData[month].totalReviews++;
            monthlyData[month].totalRating += review.rating;
            monthlyData[month].averageRating = monthlyData[month].totalRating / monthlyData[month].totalReviews;
        }
        else {
            monthlyData[month] = {
                month,
                totalReviews: 1,
                totalRating: review.rating,
                averageRating: review.rating,
            };
        }
    });
    return Object.values(monthlyData);
}
function calculateTotalStats(reviews) {
    const validReviews = reviews.filter((review) => typeof review.rating === 'number');
    if (validReviews.length === 0) {
        return { totalReviews: 0, averageRating: 0 };
    }
    const totalReviews = validReviews.length;
    const totalRating = validReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRating / totalReviews;
    return { totalReviews, averageRating };
}
function AdminAnalytics() {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [analytics, setAnalytics] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        async function fetchAnalytics() {
            try {
                // Fetch total reviews and average rating
                const { data: totalData, error: totalError } = await supabaseClient_1.supabase
                    .from('reviews')
                    .select('rating');
                if (totalError)
                    throw totalError;
                const { totalReviews, averageRating } = calculateTotalStats(totalData);
                // Fetch reviews by month
                const { data: monthlyData, error: monthlyError } = await supabaseClient_1.supabase
                    .from('reviews')
                    .select('created_at, rating')
                    .order('created_at');
                if (monthlyError)
                    throw monthlyError;
                const reviewsByMonth = processMonthlyData(monthlyData);
                // Calculate rating distribution
                const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
                    rating: i + 1,
                    count: totalData.filter(r => r.rating === i + 1).length,
                }));
                setAnalytics({
                    totalReviews,
                    averageRating,
                    reviewsByMonth,
                    ratingDistribution,
                });
            }
            catch (err) {
                handleError(err);
            }
            finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);
    const handleError = (error) => {
        // Log error for debugging in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error:', error);
        }
        setError(error instanceof Error ? error.message : 'An error occurred');
    };
    if (loading) {
        return (<AdminLayout_1.AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner_1.LoadingSpinner size="lg"/>
        </div>
      </AdminLayout_1.AdminLayout>);
    }
    if (error) {
        return (<AdminLayout_1.AdminLayout>
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      </AdminLayout_1.AdminLayout>);
    }
    if (!analytics)
        return null;
    return (<AdminLayout_1.AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.totalReviews}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.averageRating.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Reviews Over Time</h3>
          <div className="h-80">
            <recharts_1.ResponsiveContainer width="100%" height="100%">
              <recharts_1.LineChart data={analytics.reviewsByMonth}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="month"/>
                <recharts_1.YAxis />
                <recharts_1.Tooltip />
                <recharts_1.Legend />
                <recharts_1.Line type="monotone" dataKey="count" stroke="#3B82F6" name="Number of Reviews"/>
                <recharts_1.Line type="monotone" dataKey="averageRating" stroke="#10B981" name="Average Rating"/>
              </recharts_1.LineChart>
            </recharts_1.ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
          <div className="h-80">
            <recharts_1.ResponsiveContainer width="100%" height="100%">
              <recharts_1.BarChart data={analytics.ratingDistribution}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="rating"/>
                <recharts_1.YAxis />
                <recharts_1.Tooltip />
                <recharts_1.Legend />
                <recharts_1.Bar dataKey="count" fill="#3B82F6" name="Number of Reviews"/>
              </recharts_1.BarChart>
            </recharts_1.ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout_1.AdminLayout>);
}
exports.default = AdminAnalytics;
