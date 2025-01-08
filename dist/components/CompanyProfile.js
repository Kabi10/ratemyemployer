"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyStats = void 0;
const StatCard_1 = require("./ui/StatCard");
function formatRating(rating) {
    return rating !== null && rating !== void 0 ? rating : 0;
}
function formatPercentage(value) {
    return Math.round(value !== null && value !== void 0 ? value : 0);
}
function formatNumber(value) {
    return value !== null && value !== void 0 ? value : 0;
}
function CompanyStats({ company }) {
    return (<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <StatCard_1.StatCard label="Overall Rating" value={formatRating(company.average_rating)} type="rating"/>
      <StatCard_1.StatCard label="Would Recommend" value={formatPercentage(company.recommendation_rate)} type="percentage"/>
      <StatCard_1.StatCard label="Reviews" value={formatNumber(company.total_reviews)} type="number"/>
      <StatCard_1.StatCard label="CEO Rating" value={company.ceo || 'Not Available'} type="rating"/>
    </div>);
}
exports.CompanyStats = CompanyStats;
