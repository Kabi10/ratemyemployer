"use strict";
/**
 * @file src/components/CreateReview.tsx
 * Component for creating new reviews
 */
'use client';
/**
 * @file src/components/CreateReview.tsx
 * Component for creating new reviews
 */
Object.defineProperty(exports, "__esModule", { value: true });
const withAuth_1 = require("@/lib/auth/withAuth");
const useCompany_1 = require("@/hooks/useCompany");
const ReviewForm_1 = require("./ReviewForm");
function CreateReview({ companyId }) {
    const { company, isLoading, error } = (0, useCompany_1.useCompany)(companyId);
    if (isLoading) {
        return <div>Loading company details...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (!company) {
        return <div>Company not found</div>;
    }
    return (<div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Write a Review for {company.name}</h1>
      <ReviewForm_1.ReviewForm companyId={companyId}/>
    </div>);
}
// Protect the review creation for authenticated users
exports.default = (0, withAuth_1.withAuth)(CreateReview);
