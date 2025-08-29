'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { withAuth } from '@/lib/auth/withAuth'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { useToast } from '@/components/ui/use-toast'
import { formatDateDisplay } from '@/utils/date'
import Link from 'next/link'
import { Building2, Edit, Trash2, ExternalLink } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Company = Database['public']['Tables']['companies']['Row']

function AdminCompaniesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // State
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  
  // Filters
  const [verificationFilter, setVerificationFilter] = useState(searchParams.get('verification') || 'all')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = 10

  // Fetch companies with filters and pagination
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true)
      try {
        // Build query
        let query = supabase
          .from('companies')
          .select('*', { count: 'exact' })
        
        // Apply verification filter
        if (verificationFilter && verificationFilter !== 'all') {
          if (verificationFilter === 'verified') {
            query = query.eq('verified', true)
          } else if (verificationFilter === 'unverified') {
            query = query.eq('verified', false)
          } else if (verificationFilter === 'pending') {
            query = query.eq('verification_status', 'pending')
          }
        }
        
        // Apply search filter
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
        }
        
        // Apply pagination
        const start = (currentPage - 1) * itemsPerPage
        query = query
          .order('created_at', { ascending: false })
          .range(start, start + itemsPerPage - 1)
        
        const { data, error: fetchError, count } = await query

        if (fetchError) {
          throw fetchError
        }

        if (data) {
          setCompanies(data)
          setTotalCount(count || 0)
        }
      } catch (err) {
        console.error('Error fetching companies:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch companies'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
    
    // Update URL with filters
    const params = new URLSearchParams()
    if (verificationFilter && verificationFilter !== 'all') params.set('verification', verificationFilter)
    if (searchQuery) params.set('search', searchQuery)
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', url)
    
  }, [verificationFilter, searchQuery, currentPage])

  // Handle company verification
  const handleVerifyCompany = async (companyId: number, verified: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('companies')
        .update({ 
          verified: verified,
          verification_status: verified ? 'verified' : 'rejected',
          verification_date: new Date().toISOString()
        })
        .eq('id', companyId)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setCompanies(companies.map(company => 
        company.id === companyId 
          ? { 
              ...company, 
              verified: verified,
              verification_status: verified ? 'verified' : 'rejected',
              verification_date: new Date().toISOString()
            }
          : company
      ))
      
      // Show success toast
      toast({
        title: verified ? "Company Verified" : "Company Verification Rejected",
        description: `The company has been ${verified ? 'verified' : 'rejected'} successfully.`,
        variant: "default",
      })
    } catch (err) {
      console.error(`Error updating company verification:`, err)
      toast({
        title: "Error",
        description: `Failed to update company verification. Please try again.`,
        variant: "destructive",
      })
    }
  }

  // Handle company deletion
  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return
    }
    
    try {
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)

      if (deleteError) {
        throw deleteError
      }

      // Update local state
      setCompanies(companies.filter(company => company.id !== companyId))
      
      // Show success toast
      toast({
        title: "Company Deleted",
        description: "The company has been deleted successfully.",
        variant: "default",
      })
    } catch (err) {
      console.error(`Error deleting company:`, err)
      toast({
        title: "Error",
        description: `Failed to delete company. Please try again.`,
        variant: "destructive",
      })
    }
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Render loading state
  if (isLoading && companies.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  // Render error state
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error.message}</p>
        </div>
      </AdminLayout>
    )
  }

  // Render verification badge
  const getVerificationBadge = (company: Company) => {
    if (company.verified) {
      return <Badge className="bg-green-500">Verified</Badge>
    } else if (company.verification_status === 'pending') {
      return <Badge className="bg-yellow-500">Pending</Badge>
    } else {
      return <Badge className="bg-red-500">Unverified</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Company Management</h1>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {companies.length > 0 ? (
            companies.map((company) => (
              <Card key={company.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        {company.name}
                        {company.website && (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {company.industry || 'Industry not specified'} • 
                        {company.location || 'Location not specified'} • 
                        {getVerificationBadge(company)}
                      </CardDescription>
                    </div>
                    <div className="text-sm font-medium">
                      Reviews: {company.total_reviews || 0}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">CEO</p>
                      <p className="font-medium">{company.ceo || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Rating</p>
                      <p className="font-medium">{company.average_rating ? `${company.average_rating.toFixed(1)}/5` : 'No ratings'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Recommendation Rate</p>
                      <p className="font-medium">{company.recommendation_rate ? `${(company.recommendation_rate * 100).toFixed(0)}%` : 'No data'}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Created on {formatDateDisplay(company.created_at)}
                    {company.verification_date && (
                      <span className="ml-4">
                        Verification date: {formatDateDisplay(company.verification_date)}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-end space-x-2 pt-3 pb-3">
                  <Link href={`/companies/${company.id}`} passHref>
                    <Button variant="outline" size="sm">
                      <Building2 className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/companies/edit/${company.id}`} passHref>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteCompany(company.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  
                  {company.verification_status === 'pending' && (
                    <>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleVerifyCompany(company.id, false)}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleVerifyCompany(company.id, true)}
                      >
                        Verify
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No companies found matching your criteria.</p>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum = currentPage;
                if (currentPage < 3) {
                  pageNum = i + 1;
                } else if (currentPage > totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                // Ensure page numbers are within range
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </AdminLayout>
  )
}

export default withAuth(AdminCompaniesPage, { requiredRole: 'admin' })