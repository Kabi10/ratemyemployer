'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { withAuth } from '@/lib/auth/withAuth'
import { CompanyList } from '@/components/ui-library/CompanyList'
import type { Database } from '@/types/supabase'

type Company = Database['public']['Tables']['companies']['Row']

function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setCompanies(data || [])
      } catch (err) {
        console.error('Error fetching companies:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch companies'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Companies</h1>
      <div className="grid gap-4">
        {companies.map((company) => (
          <div
            key={company.id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{company.name}</h2>
                <p className="text-gray-600 mt-1">{company.industry}</p>
                <p className="text-gray-500 text-sm mt-1">{company.location}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  onClick={() => {/* Add edit functionality */}}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-medium"
                  onClick={() => {/* Add delete functionality */}}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Created on {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'Unknown date'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Wrap the component with withAuth HOC, requiring admin role
export default withAuth(AdminCompaniesPage, { requiredRole: 'admin' })