'use client'

import { createClient } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];

export default function CompanyHeader({ company }: { company: Company }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{company.name}</h2>
      <p className="text-gray-600">{company.industry}</p>
      {company.location && <p className="text-sm text-gray-500">{company.location}</p>}
    </div>
  );
}