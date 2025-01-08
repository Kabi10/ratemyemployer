"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
exports.dynamic = 'force-dynamic';
const navigation_1 = require("next/navigation");
const useCompany_1 = require("@/hooks/useCompany");
const LoadingSpinner_1 = require("@/components/LoadingSpinner");
const Toast_1 = require("@/components/Toast");
const solid_1 = require("@heroicons/react/20/solid");
const link_1 = __importDefault(require("next/link"));
function ReviewPage() {
    var _a;
    const { id } = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const { showToast } = (0, Toast_1.useToast)();
    const { company, isLoading, error } = (0, useCompany_1.useCompany)(id, { withReviews: true });
    const review = (_a = company === null || company === void 0 ? void 0 : company.reviews) === null || _a === void 0 ? void 0 : _a.find(r => r.id.toString() === id);
    if (isLoading) {
        return (<div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <LoadingSpinner_1.LoadingSpinner size="lg"/>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error.message}</div>
      </div>);
    }
    if (!review) {
        return (<div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Review not found</div>
      </div>);
    }
    return (<div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <link_1.default href={`/companies/${company === null || company === void 0 ? void 0 : company.id}`} className="text-2xl font-bold hover:text-blue-600 transition-colors">
            {company === null || company === void 0 ? void 0 : company.name}
          </link_1.default>
          <div className="text-gray-600 dark:text-gray-400 mt-1">
            {review.position} • {review.employment_status}
          </div>
        </div>

        <div className="flex items-center mb-6">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (<solid_1.StarIcon key={i} className={`h-6 w-6 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}/>))}
          </div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {review.rating} out of 5
          </span>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-xl font-semibold mb-4">{review.title}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{review.content}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {review.pros && (<div>
                <h3 className="text-lg font-medium text-green-600 dark:text-green-400 mb-2">
                  Pros
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{review.pros}</p>
              </div>)}
            {review.cons && (<div>
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                  Cons
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{review.cons}</p>
              </div>)}
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Posted on {new Date(review.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>);
}
exports.default = ReviewPage;
