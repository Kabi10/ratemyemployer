import { Company } from '@/types';
import Link from 'next/link';

export default function CompanyActions({ company }: { company: Company }) {
  return (
    <div className="p-4 flex justify-between">
      <Link href={`/companies/${company.id}`} className="text-blue-600 hover:text-blue-800">
        View Details
      </Link>
      <Link
        href={`/reviews/new?company=${company.id}`}
        className="text-green-600 hover:text-green-800"
      >
        Write Review
      </Link>
    </div>
  );
}
