'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface CheckResults {
  userRole: {
    data: any;
    error?: string;
  } | null;
  companies: {
    data: any;
    error?: string;
  } | null;
  reviews: {
    data: any;
    error?: string;
  } | null;
  auth: {
    data: any;
    error?: string;
  } | null;
}

export default function TestPage() {
  const [results, setResults] = useState<CheckResults>({
    userRole: null,
    companies: null,
    reviews: null,
    auth: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSchema() {
      const checks: CheckResults = {
        userRole: null,
        companies: null,
        reviews: null,
        auth: null,
      };

      try {
        // Check if user_role type exists
        const { data: typeData, error: typeError } = await supabase.rpc('get_user_role', {
          user_id: 'test',
        });
        checks.userRole = { data: typeData, error: typeError?.message };

        // Check companies table
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .limit(1);
        checks.companies = { data: companiesData, error: companiesError?.message };

        // Check reviews table
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .limit(1);
        checks.reviews = { data: reviewsData, error: reviewsError?.message };

        // Check auth.users table
        const { data: userData, error: userError } = await supabase.auth.getUser();
        checks.auth = { data: userData, error: userError?.message };
      } catch (error) {
        console.error('Error checking schema:', error);
      } finally {
        setResults(checks);
        setLoading(false);
      }
    }

    checkSchema();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Schema Check</h1>

      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">User Role Function</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(results.userRole, null, 2)}</pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Companies Table</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(results.companies, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Reviews Table</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(results.reviews, null, 2)}</pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Auth User</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(results.auth, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
