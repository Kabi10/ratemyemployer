"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturedCompanies = void 0;
const CompanyCard_1 = require("@/components/CompanyCard");
const useCompany_1 = require("@/hooks/useCompany");
function FeaturedCompanies() {
    const { companies, isLoading, error } = (0, useCompany_1.useCompanies)({
        limit: 3,
        withStats: true,
    });
    if (error) {
        return (<section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Companies</h2>
        <div className="text-red-500 text-center">{error.message}</div>
      </section>);
    }
    if (isLoading) {
        return (<section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Companies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (<div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>))}
        </div>
      </section>);
    }
    return (<section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Featured Companies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {companies.map(company => (<CompanyCard_1.CompanyCard key={company.id} company={company}/>))}
      </div>
    </section>);
}
exports.FeaturedCompanies = FeaturedCompanies;
