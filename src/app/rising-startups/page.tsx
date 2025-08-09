import { Metadata } from 'next';
import { RisingStartupsSection } from '@/components/RisingStartupsSection';

export const metadata: Metadata = {
  title: 'Rising Startups - RateMyEmployer',
  description: 'Discover promising startups and rapidly growing companies. Track funding rounds, expansion plans, and growth indicators to identify the next big opportunities.',
  keywords: 'rising startups, growth companies, funding rounds, career opportunities, startup jobs',
  openGraph: {
    title: 'Rising Startups - RateMyEmployer',
    description: 'Discover promising startups and rapidly growing companies with exceptional growth potential.',
    type: 'website',
  },
};

export default function RisingStartupsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <RisingStartupsSection 
          limit={50}
          showFilters={true}
          showStatistics={true}
        />
      </div>
    </div>
  );
}
