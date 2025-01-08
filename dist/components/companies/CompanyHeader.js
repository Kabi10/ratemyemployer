"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function CompanyHeader({ company }) {
    return (<div className="p-4">
      <h2 className="text-xl font-bold">{company.name}</h2>
      <p className="text-gray-600">{company.industry}</p>
      {company.location && <p className="text-sm text-gray-500">{company.location}</p>}
    </div>);
}
exports.default = CompanyHeader;
