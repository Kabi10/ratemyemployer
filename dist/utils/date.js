"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateDisplay = exports.parseDate = exports.formatDate = void 0;
/**
 * Safely formats a date string or returns a fallback value if the date is invalid
 */
function formatDate(date, options = {}) {
    const { format = 'local', fallback = 'Date not available' } = options;
    if (!date)
        return fallback;
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return fallback;
        }
        if (format === 'relative') {
            return getRelativeTimeString(dateObj);
        }
        return dateObj.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    catch (error) {
        console.error('Error formatting date:', error);
        return fallback;
    }
}
exports.formatDate = formatDate;
/**
 * Returns a relative time string (e.g., "2 hours ago", "3 days ago")
 */
function getRelativeTimeString(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    for (const [unit, seconds] of Object.entries(intervals)) {
        const value = Math.floor(diffInSeconds / seconds);
        if (value >= 1) {
            return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
        }
    }
    return 'Just now';
}
/**
 * Safely creates a Date object from a string or returns null if invalid
 */
function parseDate(date) {
    if (!date)
        return null;
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
}
exports.parseDate = parseDate;
/**
 * Formats a date for display in a consistent way across the application
 */
function formatDateDisplay(date) {
    if (!date)
        return 'Date not available';
    const dateObj = typeof date === 'string' ? parseDate(date) : date;
    if (!dateObj)
        return 'Invalid date';
    return dateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
exports.formatDateDisplay = formatDateDisplay;
