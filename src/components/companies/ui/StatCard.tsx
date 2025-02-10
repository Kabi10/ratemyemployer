interface StatCardProps {
  label: string;
  value: string | number;
  type: 'rating' | 'percentage' | 'number';
}

export function StatCard({ label, value, type }: StatCardProps) {
  const formattedValue =
    type === 'rating' && typeof value === 'number' ? value.toFixed(1) : value;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">
        {formattedValue}
        {type === 'rating' && ' / 5'}
      </p>
    </div>
  );
}
