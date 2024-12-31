import { Company } from '@/types';

export default function CompanyStats({ company }: { company: Company }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <div className="stat-card">
        <h3>Average Rating</h3>
        <p className="text-2xl font-bold">{company.average_rating.toFixed(1)}</p>
      </div>
      <div className="stat-card">
        <h3>Total Reviews</h3>
        <p className="text-2xl font-bold">{company.total_reviews}</p>
      </div>
      <div className="stat-card">
        <h3>Recommendation Rate</h3>
        <p className="text-2xl font-bold">{company.recommendation_rate}%</p>
      </div>
      <div className="stat-card">
        <h3>CEO Rating</h3>
        <p className="text-2xl font-bold">{company.ceo || 'N/A'}</p>
      </div>
    </div>
  );
}
