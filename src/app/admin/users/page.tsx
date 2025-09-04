'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { formatDateDisplay } from '@/utils/date';
import { withAuth } from '@/lib/auth/withAuth';
import { UserCheck, UserX, Mail, Calendar, Shield } from 'lucide-react';

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  app_metadata: {
    role?: string;
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    name?: string;
    full_name?: string;
  };
};

const mapSupabaseUser = (user: SupabaseUser): User => ({
  id: user.id,
  email: user.email || '',
  created_at: user.created_at,
  last_sign_in_at: user.last_sign_in_at,
  app_metadata: user.app_metadata || { role: 'user' },
  user_metadata: user.user_metadata || {}
});

function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data: { users: supabaseUsers }, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        
        const mappedUsers = (supabaseUsers || []).map(mapSupabaseUser);
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...users];
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => 
        user.app_metadata?.role === roleFilter
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.email.toLowerCase().includes(query) || 
        user.user_metadata?.name?.toLowerCase().includes(query) ||
        user.user_metadata?.full_name?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, roleFilter, searchQuery]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        app_metadata: { role: newRole }
      });

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, app_metadata: { ...u.app_metadata, role: newRole } }
          : u
      ));

      toast({
        title: "User role updated",
        description: `User role has been updated to ${newRole}.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Error updating user role:', err);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get role badge
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500">Moderator</Badge>;
      case 'user':
      default:
        return <Badge className="bg-gray-500">User</Badge>;
    }
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        {user.user_metadata?.name || user.user_metadata?.full_name || user.email}
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email} • {getRoleBadge(user.app_metadata?.role)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium">{formatDateDisplay(user.created_at)}</p>
                      </div>
                    </div>
                    {user.last_sign_in_at && (
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Last Sign In</p>
                          <p className="font-medium">{formatDateDisplay(user.last_sign_in_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-end space-x-2 pt-3 pb-3">
                  <div className="flex items-center mr-auto">
                    <Shield className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-500 mr-2">Role:</span>
                    <Select 
                      value={user.app_metadata?.role || 'user'} 
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Implement user details view
                      toast({
                        title: "Not implemented",
                        description: "User details view is not implemented yet.",
                        variant: "default",
                      });
                    }}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No users found matching your criteria.</p>
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
  );
}

export default withAuth(AdminUsersPage, { requiredRole: 'admin' });