import { cn } from "@/lib/utils";


interface ErrorDisplayProps {
  message: string;
  className?: string;
}

export function ErrorDisplay({ message, className }: ErrorDisplayProps) {
  return (
    <div className={cn("max-w-4xl mx-auto p-6", className)}>
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700 dark:text-red-200">{message}</p>
      </div>
    </div>
  );
}