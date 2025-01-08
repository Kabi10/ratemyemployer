"use strict";
// app/companies/[id]/page.tsx
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const ReviewForm_1 = require("@/components/ReviewForm");
const ReviewList_1 = require("@/components/ReviewList");
const useCompany_1 = require("@/hooks/useCompany");
const outline_1 = require("@heroicons/react/24/outline");
function CompanyPage() {
    const { id } = (0, navigation_1.useParams)();
    const { company, isLoading, error } = (0, useCompany_1.useCompany)(id);
    const [showReviewForm, setShowReviewForm] = (0, react_1.useState)(false);
    if (isLoading) {
        return (<div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (<div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>))}
        </div>
      </div>);
    }
    if (error || !company) {
        return (<div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Error loading company details</p>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
            {company.verification_status === 'verified' && (<div className="flex items-center space-x-1 text-blue-500">
                <outline_1.CheckBadgeIcon className="h-6 w-6"/>
                <span className="text-sm font-medium">Verified</span>
              </div>)}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {company.average_rating ? company.average_rating.toFixed(1) : 'N/A'}
            </span>
            <outline_1.StarIcon className="h-6 w-6 text-yellow-400"/>
          </div>
        </div>
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-300">Industry: {company.industry}</p>
              <p className="text-gray-600 dark:text-gray-300">Location: {company.location}</p>
            </div>
            <div className="text-right">
              <button onClick={() => setShowReviewForm(true)} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button onClick={() => setShowReviewForm(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <outline_1.XMarkIcon className="w-6 h-6"/>
              </button>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Write a Review for {company.name}</h2>
                <ReviewForm_1.ReviewForm companyId={company.id} onSuccess={() => setShowReviewForm(false)}/>
              </div>
            </div>
          </div>)}

        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Reviews</h2>
          <ReviewList_1.ReviewList companyId={company.id}/>
        </div>
      </div>
    </div>);
}
exports.default = CompanyPage;
