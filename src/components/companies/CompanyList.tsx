import { Company } from '@/types';
import { CompanyCard } from '../CompanyCard';

export function CompanyList({ companies }: { companies: Company[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map(company => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
