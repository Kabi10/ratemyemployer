import { useState, useEffect } from 'react';
import { Company, Review } from '@/types/database';
import { fetchData } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';

export function useCompanyData(companyId: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [companyData, reviewsData] = await Promise.all([
          fetchData(supabase.from('companies').select('*').eq('id', companyId).single()),
          fetchData(
            supabase
              .from('reviews')
              .select(
                `
              *,
              user_profiles:user_id (
                username,
                email
              )
            `
              )
              .eq('company_id', companyId)
          ),
        ]);

        if (companyData.error) throw companyData.error;
        if (reviewsData.error) throw reviewsData.error;

        setCompany(companyData.data);
        setReviews(reviewsData.data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [companyId]);

  return { company, reviews, loading, error };
}
