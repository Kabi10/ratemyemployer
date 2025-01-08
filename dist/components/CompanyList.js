"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const CompanyCard_1 = require("@/components/CompanyCard");
const useCompany_1 = require("@/hooks/useCompany");
const List_1 = require("@/components/ui/List");
const ITEMS_PER_PAGE = 9;
function CompanyList({ selectedLocation, selectedIndustry, searchQuery }) {
    const [page, setPage] = (0, react_1.useState)(1);
    const { companies, totalCount, isLoading, error } = (0, useCompany_1.useCompanies)({
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
        location: selectedLocation !== 'all' ? selectedLocation : '',
        industry: selectedIndustry !== 'all' ? selectedIndustry : '',
        searchQuery: searchQuery,
    });
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const keyExtractor = (company) => String(company.id || '');
    return (<List_1.List items={companies} renderItem={(company) => <CompanyCard_1.CompanyCard company={company}/>} keyExtractor={keyExtractor} isLoading={isLoading} error={error} emptyMessage="No companies found." loadingItemCount={ITEMS_PER_PAGE} gridCols={{ default: 1, md: 2, lg: 3 }} pagination={{
            page,
            totalPages,
            onPageChange: setPage,
        }}/>);
}
exports.default = CompanyList;
