'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

export default function SearchAndFilter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [industries, setIndustries] = useState<string[]>([]);

  useEffect(() => {
    async function fetchIndustries() {
      const supabase = createClient();
      const { data, error } = await supabase.from('companies').select('industry');

      if (error) {
        console.error('Error fetching industries:', error);
        return;
      }

      const uniqueIndustries = Array.from(new Set(data.map(item => item.industry)))
        .filter(Boolean)
        .sort();

      setIndustries(uniqueIndustries);
    }

    fetchIndustries();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <select
          value={selectedIndustry}
          onChange={e => setSelectedIndustry(e.target.value)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="all">All Industries</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
