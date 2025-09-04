import { cn } from "@/lib/utils";


interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ message, onRetry, className }: ErrorDisplayProps) {
  return (
    <div className={cn("max-w-4xl mx-auto p-6 text-center", className)}>
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700 dark:text-red-200 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
