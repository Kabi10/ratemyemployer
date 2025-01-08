"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyStats = void 0;
const StatCard_1 = require("@/components/ui/StatCard");
function CompanyStats({ company }) {
    const rating = company.average_rating || 0;
    const totalReviews = company.total_reviews || 0;
    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard_1.StatCard label="Overall Rating" value={rating} type="rating"/>
      <StatCard_1.StatCard label="Reviews" value={totalReviews} type="number"/>
      <StatCard_1.StatCard label="Recommendation Rate" value={0} type="percentage"/>
    </div>);
}
exports.CompanyStats = CompanyStats;
