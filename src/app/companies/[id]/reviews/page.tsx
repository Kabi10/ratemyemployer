import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { EnhancedReviewListContainer } from '@/components/EnhancedReviewListContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCompany, getReviews } from '@/lib/database';
import { StatCard } from '@/components/StatCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CompanyLogoOrPlaceholder } from '@/components/CompanyLogoOrPlaceholder';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompany(parseInt(params.id, 10));
  
  if (!company.data) {
    return {
      title: 'Company Not Found | RateMyEmployer',
    };
  }
  
  return {
    title: `${company.data.name} Reviews | RateMyEmployer`,
    description: `Read and filter employee reviews for ${company.data.name}. Find out what it's like to work at ${company.data.name} from real employees.`,
  };
}

export default async function CompanyReviewsPage({ params }: Props) {
  const { id } = params;
  const companyId = parseInt(id, 10);
  
  // Get company details
  const companyResult = await getCompany(companyId);
  
  if (!companyResult.data) {
    notFound();
  }
  
  const company = companyResult.data;
  
  // Get initial reviews for the company
  const initialReviewsResult = await getReviews({
    companyId,
    limit: 5,
    status: 'approved',
    page: 1
  });

  // Calculate rating distribution
  const ratings = [0, 0, 0, 0, 0]; // Rating counts for 1-5 stars
  
  if (initialReviewsResult.data) {
    initialReviewsResult.data.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratings[Math.floor(review.rating) - 1]++;
      }
    });
  }
  
  // Calculate averages
  const totalReviews = initialReviewsResult.count || 0;
  const averageRating = company.average_rating || 0;

  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-6">
        <Link href={`/companies/${id}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Company Profile
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="h-16 w-16 relative rounded overflow-hidden">
            <CompanyLogoOrPlaceholder company={company} />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {company.industry} • {company.location}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Employee Reviews</CardTitle>
              <CardDescription>
                What employees are saying about working at {company.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Suspense fallback={<ReviewsLoading />}>
                <EnhancedReviewListContainer 
                  initialReviews={initialReviewsResult.data || []} 
                  initialCount={initialReviewsResult.count || 0}
                  companyId={id}
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mb-2">
                  <div className="text-5xl font-bold">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">
                    from {totalReviews} reviews
                  </div>
                </div>
                
                {/* Rating distribution */}
                <div className="space-y-2 mt-4">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = ratings[star - 1];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    
                    return (
                      <div key={star} className="flex items-center">
                        <span className="w-8 text-sm">{star}★</span>
                        <div className="flex-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-right text-gray-500">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatCard 
                  title="Average Satisfaction" 
                  value={company.average_rating || 0} 
                  maxValue={5}
                  suffix="/5"
                />
                
                <StatCard 
                  title="Recommend to Friend" 
                  value={company.recommend_percentage || 0}
                  suffix="%"
                  description="Would recommend to a friend"
                />
                
                <StatCard 
                  title="Work/Life Balance" 
                  value={company.work_life_balance || 0}
                  maxValue={5}
                  suffix="/5"
                />
                
                <StatCard 
                  title="Compensation & Benefits" 
                  value={company.compensation_rating || 0}
                  maxValue={5}
                  suffix="/5"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Review Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5 text-sm">
                  <li>Be honest and specific</li>
                  <li>Focus on your personal experience</li>
                  <li>Avoid naming specific individuals</li>
                  <li>No offensive or discriminatory content</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function ReviewsLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 dark:bg-gray-800 animate-pulse h-40 rounded-lg"
        />
      ))}
    </div>
  );
} 