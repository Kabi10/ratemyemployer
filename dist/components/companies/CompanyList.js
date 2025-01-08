"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyList = void 0;
const CompanyCard_1 = require("../CompanyCard");
function CompanyList({ companies }) {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map(company => (<CompanyCard_1.CompanyCard key={company.id} company={company}/>))}
    </div>);
}
exports.CompanyList = CompanyList;
