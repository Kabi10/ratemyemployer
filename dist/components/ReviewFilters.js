"use strict";
// components/ReviewFilters.tsx
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
function ReviewFilters({ currentFilters, currentSort }) {
    const dispatchFilterChange = (key, value) => {
        const event = new CustomEvent('filterChange', {
            detail: { key, value },
        });
        window.dispatchEvent(event);
    };
    const dispatchSortChange = (sort) => {
        const event = new CustomEvent('sortChange', {
            detail: sort,
        });
        window.dispatchEvent(event);
    };
    return (<div className="space-y-4">
      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Minimum Rating</label>
        <select value={currentFilters.minRating} onChange={e => dispatchFilterChange('minRating', Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value={0}>All Ratings</option>
          {[1, 2, 3, 4, 5].map(rating => (<option key={rating} value={rating}>
              {rating}+ Stars
            </option>))}
        </select>
      </div>

      {/* Employment Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Employment Status</label>
        <select value={currentFilters.employmentStatus} onChange={e => dispatchFilterChange('employmentStatus', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value="all">All</option>
          <option value="current">Current Employee</option>
          <option value="former">Former Employee</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Time Period</label>
        <select value={currentFilters.dateRange} onChange={e => dispatchFilterChange('dateRange', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value="all">All Time</option>
          <option value="month">Last Month</option>
          <option value="6months">Last 6 Months</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Sort By</label>
        <select value={currentSort} onChange={e => dispatchSortChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>
    </div>);
}
exports.default = ReviewFilters;
