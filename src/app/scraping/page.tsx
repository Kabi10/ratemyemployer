import { Metadata } from 'next';
import { WebScrapingDashboard } from '@/components/WebScrapingDashboard';

export const metadata: Metadata = {
  title: 'Web Scraping Dashboard - RateMyEmployer',
  description: 'Monitor and manage automated data collection operations. Advanced web scraping infrastructure for company data, reviews, news, and job listings.',
  keywords: 'web scraping, data collection, automation, company data, reviews, news monitoring',
  openGraph: {
    title: 'Web Scraping Dashboard - RateMyEmployer',
    description: 'Advanced web scraping infrastructure for automated data collection and enhancement.',
    type: 'website',
  },
};

export default function ScrapingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <WebScrapingDashboard 
          showCreateJob={true}
          showEngineControls={true}
        />
      </div>
    </div>
  );
}
