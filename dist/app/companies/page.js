"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const CompanyForm_1 = require("@/components/CompanyForm");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
// Lazy load components
const SearchAndFilter = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('@/components/SearchAndFilter'))));
const CompanyList = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('@/components/CompanyList'))));
// Loading fallbacks
function SearchSkeleton() {
    return (<div className="max-w-3xl mx-auto mb-8">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
      </div>
    </div>);
}
function CompanyListSkeleton() {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (<div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>))}
    </div>);
}
function CompaniesPage() {
    const [selectedLocation, setSelectedLocation] = (0, react_1.useState)('all');
    const [selectedIndustry, setSelectedIndustry] = (0, react_1.useState)('all');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [showAddCompany, setShowAddCompany] = (0, react_1.useState)(false);
    return (<main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 page-transition">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Companies</h1>
          <button_1.Button onClick={() => setShowAddCompany(true)} className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-sm transition-colors">
            Add Company
          </button_1.Button>
        </div>

        <react_1.Suspense fallback={<SearchSkeleton />}>
          <SearchAndFilter onLocationChange={setSelectedLocation} onIndustryChange={setSelectedIndustry} onSearchChange={setSearchQuery}/>
        </react_1.Suspense>

        <div className="mt-12">
          <react_1.Suspense fallback={<CompanyListSkeleton />}>
            <CompanyList selectedLocation={selectedLocation} selectedIndustry={selectedIndustry} searchQuery={searchQuery}/>
          </react_1.Suspense>
        </div>
      </div>

      {/* Add Company Modal */}
      {showAddCompany && (<div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity dialog-backdrop"/>
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-md dialog-content">
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                          Add New Company
                        </h2>
                        <button_1.Button variant="ghost" size="icon" onClick={() => setShowAddCompany(false)}>
                          <lucide_react_1.X className="h-6 w-6"/>
                        </button_1.Button>
                      </div>
                      <CompanyForm_1.CompanyForm onSuccess={() => setShowAddCompany(false)}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>)}
    </main>);
}
exports.default = CompaniesPage;
