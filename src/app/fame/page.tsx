import { WallOfCompanies } from '@/components/WallOfCompanies';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function WallOfFamePage() {
  return (
    <WallOfCompanies
      type="fame"
      title="Wall of Fame"
      description="Discover the highest-rated employers based on employee reviews. These companies have earned their place on our Wall of Fame through exceptional workplace practices and employee satisfaction."
      limit={10}
    />
  );
}