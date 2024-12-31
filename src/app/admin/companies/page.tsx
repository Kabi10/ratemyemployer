'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Company } from '@/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function AdminCompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      showToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCompany(companyId: string) {
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          verified: true,
          verification_date: new Date().toISOString(),
        })
        .eq('id', companyId);

      if (error) throw error;
      showToast('Company verified successfully', 'success');
      fetchCompanies();
    } catch (error) {
      console.error('Error verifying company:', error);
      showToast('Failed to verify company', 'error');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Companies</h1>
      <div className="space-y-4">
        {companies.map(company => (
          <div key={company.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{company.name}</h2>
                <p className="text-gray-600">{company.industry}</p>
                <p className="text-sm text-gray-500">{company.location}</p>
              </div>
              <div className="flex items-center space-x-4">
                {!company.verified && (
                  <button
                    onClick={() => handleVerifyCompany(company.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Verify
                  </button>
                )}
                <button
                  onClick={() => router.push(`/companies/${company.id}/edit`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Reviews:</span> {company.total_reviews}
              </div>
              <div>
                <span className="font-medium">Rating:</span> {company.average_rating.toFixed(1)}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(company.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
