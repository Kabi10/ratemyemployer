"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmploymentStatus = exports.EMPLOYMENT_STATUSES = exports.isValidIndustry = exports.INDUSTRIES = void 0;
// Constants
exports.INDUSTRIES = [
    'Technology',
    'Finance',
    'Healthcare',
    'Retail',
    'Manufacturing',
    'Education',
    'Construction',
    'Entertainment',
    'Transportation',
    'Energy',
    'Real Estate',
    'Agriculture',
    'Other'
];
// Type guards
const isValidIndustry = (industry) => {
    return industry !== null && exports.INDUSTRIES.includes(industry);
};
exports.isValidIndustry = isValidIndustry;
exports.EMPLOYMENT_STATUSES = ['Full-time', 'Part-time', 'Contract', 'Intern'];
const isValidEmploymentStatus = (status) => {
    return exports.EMPLOYMENT_STATUSES.includes(status);
};
exports.isValidEmploymentStatus = isValidEmploymentStatus;
