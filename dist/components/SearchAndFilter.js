"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const supabaseClient_1 = require("@/lib/supabaseClient");
function SearchAndFilter({ onLocationChange, onIndustryChange, onSearchChange }) {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [selectedIndustry, setSelectedIndustry] = (0, react_1.useState)('all');
    const [selectedLocation, setSelectedLocation] = (0, react_1.useState)('all');
    const [industries, setIndustries] = (0, react_1.useState)([]);
    const [locations, setLocations] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            const supabase = (0, supabaseClient_1.createClient)();
            // Fetch industries
            const { data: industryData, error: industryError } = await supabase
                .from('companies')
                .select('industry');
            if (industryError) {
                console.error('Error fetching industries:', industryError);
            }
            else {
                const uniqueIndustries = Array.from(new Set(industryData
                    .map(item => item.industry)
                    .filter((industry) => industry !== null)))
                    .sort();
                setIndustries(uniqueIndustries);
            }
            // Fetch locations
            const { data: locationData, error: locationError } = await supabase
                .from('companies')
                .select('location');
            if (locationError) {
                console.error('Error fetching locations:', locationError);
            }
            else {
                const uniqueLocations = Array.from(new Set(locationData
                    .map(item => item.location)
                    .filter((location) => location !== null)))
                    .sort();
                setLocations(uniqueLocations);
            }
        }
        fetchData();
    }, []);
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        onSearchChange === null || onSearchChange === void 0 ? void 0 : onSearchChange(value);
    };
    const handleIndustryChange = (value) => {
        setSelectedIndustry(value);
        onIndustryChange === null || onIndustryChange === void 0 ? void 0 : onIndustryChange(value);
    };
    const handleLocationChange = (value) => {
        setSelectedLocation(value);
        onLocationChange === null || onLocationChange === void 0 ? void 0 : onLocationChange(value);
    };
    return (<div className="max-w-3xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" placeholder="Search companies..." value={searchTerm} onChange={e => handleSearchChange(e.target.value)} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/>
        <select value={selectedIndustry} onChange={e => handleIndustryChange(e.target.value)} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
          <option value="all">All Industries</option>
          {industries.map(industry => (<option key={industry} value={industry}>
              {industry}
            </option>))}
        </select>
        <select value={selectedLocation} onChange={e => handleLocationChange(e.target.value)} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
          <option value="all">All Locations</option>
          {locations.map(location => (<option key={location} value={location}>
              {location}
            </option>))}
        </select>
      </div>
    </div>);
}
exports.default = SearchAndFilter;
