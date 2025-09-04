import { Metadata } from 'next';
import { FinancialDistressSection } from '@/components/FinancialDistressSection';

export const metadata: Metadata = {
  title: 'Financial Distress Monitor - RateMyEmployer',
  description: 'Track companies experiencing financial difficulties, layoffs, and other distress indicators. Stay informed about workplace stability and make better career decisions.',
  keywords: 'financial distress, layoffs, company stability, workplace safety, career decisions',
  openGraph: {
    title: 'Financial Distress Monitor - RateMyEmployer',
    description: 'Track companies experiencing financial difficulties and make informed career decisions.',
    type: 'website',
  },
};

export default function FinancialDistressPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <FinancialDistressSection 
          limit={50}
          showFilters={true}
          showStatistics={true}
        />
      </div>
    </div>
  );
}
