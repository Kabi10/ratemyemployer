import { WallOfCompanies } from '@/components/WallOfCompanies';

export default function WallOfShamePage() {
  return (
    <WallOfCompanies
      type="shame"
      title="Wall of Shame"
      description="These companies have received consistently low ratings from employees. The Wall of Shame highlights workplaces that may need to improve their employee satisfaction and workplace practices."
      limit={10}
    />
  );
}