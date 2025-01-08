"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const ReviewForm_1 = require("@/components/ReviewForm");
function NewReviewForm() {
    const searchParams = (0, navigation_1.useSearchParams)();
    const companyId = searchParams.get('companyId');
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Share Your Experience
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Help others make informed career decisions by sharing your workplace insights
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-2">Guidelines for a Great Review:</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Be honest and objective in your assessment
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Provide specific examples to support your points
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Keep it professional and constructive
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Focus on your personal experience
              </li>
            </ul>
          </div>

          <ReviewForm_1.ReviewForm companyId={companyId || undefined} onSuccess={() => {
            // Success handling is now done in the form component
        }}/>
        </div>
      </div>
    </div>);
}
function NewReviewPage() {
    return (<react_1.Suspense fallback={<div>Loading...</div>}>
      <NewReviewForm />
    </react_1.Suspense>);
}
exports.default = NewReviewPage;
