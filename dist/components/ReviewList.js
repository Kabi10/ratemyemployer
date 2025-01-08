"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewList = void 0;
const solid_1 = require("@heroicons/react/20/solid");
const useCompany_1 = require("@/hooks/useCompany");
const date_1 = require("@/utils/date");
function ReviewCard({ review }) {
    var _a;
    const rating = (_a = review.rating) !== null && _a !== void 0 ? _a : 0;
    return (<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (<solid_1.StarIcon key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}/>))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {review.position || 'Position not specified'} • 
            {review.employment_status || 'Status not specified'}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {(0, date_1.formatDateDisplay)(review.created_at)}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{review.title || 'Untitled Review'}</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content || 'No content provided'}</p>
      {(review.pros || review.cons) && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {review.pros && (<div>
              <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Pros</h4>
              <p className="text-gray-600 dark:text-gray-400">{review.pros}</p>
            </div>)}
          {review.cons && (<div>
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Cons</h4>
              <p className="text-gray-600 dark:text-gray-400">{review.cons}</p>
            </div>)}
        </div>)}
    </div>);
}
function ReviewList({ companyId }) {
    var _a;
    const { company, isLoading, error } = (0, useCompany_1.useCompany)(companyId, { withReviews: true });
    const reviews = (_a = company === null || company === void 0 ? void 0 : company.reviews) !== null && _a !== void 0 ? _a : [];
    const keyExtractor = (review) => {
        var _a, _b;
        return (_b = (_a = review.id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : `review-${Math.random()}`;
    };
    return (<div className="space-y-6">
      {reviews.map(review => (<ReviewCard key={keyExtractor(review)} review={review}/>))}
      {reviews.length === 0 && !isLoading && !error && (<p className="text-center text-gray-500">
          No reviews yet. Be the first to review this company!
        </p>)}
      {isLoading && (<div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (<div key={i} className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"/>))}
        </div>)}
      {error && (<p className="text-center text-red-500">
          Error loading reviews. Please try again later.
        </p>)}
    </div>);
}
exports.ReviewList = ReviewList;
