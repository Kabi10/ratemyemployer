import { StarIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  className?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({ rating, className, showValue = false, size = 'md' }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const halfFilled = i === Math.floor(rating) && rating % 1 !== 0;

    return (
      <StarIcon
        key={i}
        className={cn(
          sizeClasses[size],
          filled ? 'text-yellow-400' : 'text-gray-300',
          halfFilled && 'text-gradient-to-r from-yellow-400 to-gray-300',
          'flex-shrink-0'
        )}
        aria-hidden="true"
      />
    );
  });

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">{stars}</div>
      {showValue && (
        <span className="ml-1 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
} 