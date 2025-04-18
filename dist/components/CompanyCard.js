"use strict";
// components/CompanyCard.tsx
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyCard = void 0;
const link_1 = __importDefault(require("next/link"));
const card_1 = require("./ui/card");
function CompanyCard({ company }) {
    const rating = company.average_rating || 0;
    const totalReviews = company.total_reviews || 0;
    const ratingPercentage = (rating / 5) * 100;
    // Get color based on rating
    const getProgressColor = (rating) => {
        if (rating >= 4)
            return 'bg-green-500';
        if (rating >= 3)
            return 'bg-yellow-500';
        if (rating >= 2)
            return 'bg-orange-500';
        return 'bg-red-500';
    };
    return (<link_1.default href={`/companies/${company.id}`}>
      <card_1.Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{company.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{company.industry}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{company.location}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-1">{rating.toFixed(1)}</span>
              <span className="text-yellow-400">★</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{totalReviews} reviews</div>
          </div>
        </div>

        {/* Rating Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${getProgressColor(rating)}`} style={{ width: `${ratingPercentage}%` }} role="progressbar" aria-valuenow={rating} aria-valuemin={0} aria-valuemax={5}/>
          </div>
        </div>
        
        {company.description && (<p className="mt-4 text-gray-700 dark:text-gray-300 line-clamp-2">{company.description}</p>)}

        <div className="mt-4 flex flex-wrap gap-2">
          {company.size && (<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {company.size}
            </span>)}
          {company.verification_status === 'verified' && (<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Verified
            </span>)}
        </div>
      </card_1.Card>
    </link_1.default>);
}
exports.CompanyCard = CompanyCard;
