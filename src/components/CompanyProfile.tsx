import { StatCard } from './ui/StatCard';
import { Company } from '@/types';

function formatRating(rating: number | null): number {
  return rating ?? 0;
}

function formatPercentage(value: number | null): number {
  return Math.round(value ?? 0);
}

function formatNumber(value: number | null): number {
  return value ?? 0;
}

export function CompanyStats({ company }: { company: Company }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <StatCard 
        label="Overall Rating" 
        value={formatRating(company.average_rating)} 
        type="rating" 
      />
      <StatCard
        label="Would Recommend"
        value={formatPercentage(company.recommendation_rate)}
        type="percentage"
      />
      <StatCard 
        label="Reviews" 
        value={formatNumber(company.total_reviews)} 
        type="number" 
      />
      <StatCard 
        label="CEO Rating" 
        value={company.ceo || 'Not Available'} 
        type="rating" 
      />
    </div>
  );
}
