import { Metadata } from 'next';
import DesignSystemShowcase from '@/components/DesignSystemShowcase';

export const metadata: Metadata = {
  title: 'Design System - RateMyEmployer',
  description: 'Comprehensive design system showcase featuring modern UI components, accessibility features, and design patterns for RateMyEmployer platform.',
  keywords: 'design system, UI components, accessibility, modern design, user interface',
  openGraph: {
    title: 'Design System - RateMyEmployer',
    description: 'Modern, accessible design system with comprehensive UI components and patterns.',
    type: 'website',
  },
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
