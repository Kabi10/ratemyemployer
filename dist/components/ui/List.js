"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
const lucide_react_1 = require("lucide-react");
function List({ items, renderItem, keyExtractor, isLoading = false, error = null, emptyMessage = 'No items found.', loadingItemCount = 3, renderLoading, renderError, pagination, gridCols = { default: 1 }, className = '', }) {
    if (error) {
        if (renderError) {
            return renderError(error);
        }
        return (<div className="text-center py-8">
        <p className="text-red-500">{error.message}</p>
      </div>);
    }
    if (isLoading) {
        if (renderLoading) {
            return renderLoading();
        }
        return (<div className={`grid grid-cols-${gridCols.default} ${gridCols.md ? `md:grid-cols-${gridCols.md}` : ''} ${gridCols.lg ? `lg:grid-cols-${gridCols.lg}` : ''} gap-6`}>
        {[...Array(loadingItemCount)].map((_, i) => (<div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>))}
      </div>);
    }
    if (items.length === 0) {
        return (<div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>);
    }
    return (<div className={`space-y-8 ${className}`}>
      <div className={`grid grid-cols-${gridCols.default} ${gridCols.md ? `md:grid-cols-${gridCols.md}` : ''} ${gridCols.lg ? `lg:grid-cols-${gridCols.lg}` : ''} gap-6`}>
        {items.map((item) => (<div key={keyExtractor(item)}>{renderItem(item)}</div>))}
      </div>

      {pagination && pagination.totalPages > 1 && (<div className="flex justify-center items-center space-x-4">
          <button onClick={() => pagination.onPageChange(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
            <lucide_react_1.ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button onClick={() => pagination.onPageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
            <lucide_react_1.ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
          </button>
        </div>)}
    </div>);
}
exports.List = List;
