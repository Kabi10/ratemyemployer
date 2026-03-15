interface StatCardProps {
  label?: string;
  title?: string;
  value: string | number;
  type?: 'rating' | 'percentage' | 'number';
  maxValue?: number;
  suffix?: string;
  description?: string;
}

export function StatCard({ label, title, value, type, maxValue, suffix, description }: StatCardProps) {
  const displayLabel = label || title || '';
  const formattedValue = type === 'rating' && typeof value === 'number' ? value.toFixed(1) : value;
  const displaySuffix = suffix || (type === 'rating' ? ' / 5' : '');

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-600">{displayLabel}</p>
      <p className="text-2xl font-bold">
        {formattedValue}{displaySuffix}
      </p>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
}
