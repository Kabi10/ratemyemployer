'use client';

import { ReactNode } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  loadingItemCount?: number;
  renderLoading?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  gridCols?: {
    default: number;
    md?: number;
    lg?: number;
  };
  className?: string;
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  isLoading = false,
  error = null,
  emptyMessage = 'No items found.',
  loadingItemCount = 3,
  renderLoading,
  renderError,
  pagination,
  gridCols = { default: 1 },
  className = '',
}: ListProps<T>) {
  if (error) {
    if (renderError) {
      return renderError(error);
    }
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    if (renderLoading) {
      return renderLoading();
    }
    return (
      <div
        className={`grid grid-cols-${gridCols.default} ${
          gridCols.md ? `md:grid-cols-${gridCols.md}` : ''
        } ${gridCols.lg ? `lg:grid-cols-${gridCols.lg}` : ''} gap-6`}
      >
        {[...Array(loadingItemCount)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div
        className={`grid grid-cols-${gridCols.default} ${
          gridCols.md ? `md:grid-cols-${gridCols.md}` : ''
        } ${gridCols.lg ? `lg:grid-cols-${gridCols.lg}` : ''} gap-6`}
      >
        {items.map((item) => (
          <div key={keyExtractor(item)}>{renderItem(item)}</div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
}

export default List;
