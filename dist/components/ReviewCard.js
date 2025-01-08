"use strict";
// components/ReviewCard.tsx
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewCard = void 0;
const react_1 = __importDefault(require("react"));
const ReviewActions_1 = require("./ReviewActions");
const date_1 = require("@/utils/date");
function getRatingStars(rating) {
    const validRating = Math.max(0, Math.min(rating || 0, 5));
    return {
        filled: validRating,
        empty: 5 - validRating
    };
}
function ReviewCard({ review }) {
    var _a;
    const stars = getRatingStars(review.rating);
    const reviewId = ((_a = review.id) === null || _a === void 0 ? void 0 : _a.toString()) || '0';
    return (<div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{review.title || 'Untitled Review'}</h3>
          <p className="text-gray-600">{review.position || 'Position not specified'}</p>
          <p className="text-sm text-gray-500">
            {review.employment_status || 'Employment status not specified'} • 
            {review.is_current_employee ? 'Current Employee' : 'Former Employee'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-2xl text-yellow-400">{'★'.repeat(stars.filled)}</div>
          <div className="text-2xl text-gray-300">{'★'.repeat(stars.empty)}</div>
        </div>
      </div>

      <div>
        <p className="text-gray-700 whitespace-pre-wrap">{review.content || 'No content provided'}</p>
      </div>

      {(review.pros || review.cons) && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {review.pros && (<div>
              <h4 className="font-medium text-green-600 mb-2">Pros</h4>
              <p className="text-gray-600">{review.pros}</p>
            </div>)}
          {review.cons && (<div>
              <h4 className="font-medium text-red-600 mb-2">Cons</h4>
              <p className="text-gray-600">{review.cons}</p>
            </div>)}
        </div>)}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-500">
          {(0, date_1.formatDateDisplay)(review.created_at)}
        </div>
        <ReviewActions_1.ReviewActions reviewId={parseInt(reviewId)} initialLikes={review.likes || 0}/>
      </div>
    </div>);
}
exports.ReviewCard = ReviewCard;
