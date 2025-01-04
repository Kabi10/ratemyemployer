/**
 * @file src/components/CreateReview.tsx
 * Component for creating new reviews
 */

'use client';

import { withAuth } from '@/lib/auth/withAuth';
import { useCompany } from '@/hooks/useCompany';
import { ReviewForm } from './ReviewForm';

interface CreateReviewProps {
  companyId: string;
}

function CreateReview({ companyId }: CreateReviewProps) {
  const { company, isLoading, error } = useCompany(companyId);

  if (isLoading) {
    return <div>Loading company details...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Write a Review for {company.name}</h1>
      <ReviewForm companyId={companyId} />
    </div>
  );
}

// Protect the review creation for authenticated users
export default withAuth(CreateReview);
