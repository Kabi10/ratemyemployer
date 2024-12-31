import { StatCard } from './ui/StatCard';
import { Company } from '@/types';

export function CompanyStats({ company }: { company: Company }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <StatCard label="Overall Rating" value={company.average_rating} type="rating" />
      <StatCard
        label="Would Recommend"
        value={`${company.recommendation_rate}%`}
        type="percentage"
      />
      <StatCard label="Reviews" value={company.total_reviews} type="number" />
      <StatCard label="CEO Rating" value={company.ceo || 'N/A'} type="rating" />
    </div>
  );
}
