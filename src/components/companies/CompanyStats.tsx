import { Company } from '@/types';
import { StatCard } from '@/components/ui/StatCard';

export function CompanyStats({ company }: { company: Company }) {
  const rating = company.average_rating || 0;
  const totalReviews = company.total_reviews || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Overall Rating"
        value={rating}
        type="rating"
      />
      <StatCard
        label="Reviews"
        value={totalReviews}
        type="number"
      />
      <StatCard
        label="Recommendation Rate"
        value={0}
        type="percentage"
      />
    </div>
  );
}
