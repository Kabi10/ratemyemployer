"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const withAuth_1 = require("@/lib/auth/withAuth");
const useCompany_1 = require("@/hooks/useCompany");
function AdminCompaniesPage() {
    const { companies, isLoading, error } = (0, useCompany_1.useCompanies)();
    if (isLoading) {
        return <div>Loading companies...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    return (<div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Companies</h1>
      <div className="grid gap-4">
        {companies === null || companies === void 0 ? void 0 : companies.map((company) => (<div key={company.id} className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold">{company.name}</h2>
            <p className="text-gray-600">{company.description}</p>
            {/* Add admin actions here */}
          </div>))}
      </div>
    </div>);
}
// Wrap the component with withAuth HOC, requiring admin role
exports.default = (0, withAuth_1.withAuth)(AdminCompaniesPage, { requiredRole: 'admin' });
