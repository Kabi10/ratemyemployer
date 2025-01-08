"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchBar = void 0;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
function SearchBar() {
    const router = (0, navigation_1.useRouter)();
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    };
    return (<form onSubmit={handleSearch} className="flex gap-2">
      <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border rounded-md px-4 py-2" placeholder="Search companies..."/>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Search
      </button>
    </form>);
}
exports.SearchBar = SearchBar;
