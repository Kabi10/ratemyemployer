'use client'


import { useState, useEffect } from 'react';

import { User as SupabaseUser } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabaseClient';

import { AdminLayout } from '@/components/layouts/AdminLayout';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/toast';
import { withAuth } from '@/lib/auth/withAuth';

type User = {
  id: string;
  email: string;
  created_at: string;
  app_metadata: {
    role?: string;
    provider?: string;
    providers?: string[];
  };
};

const mapSupabaseUser = (user: SupabaseUser): User => ({
  id: user.id,
  email: user.email || '',
  created_at: user.created_at,
  app_metadata: user.app_metadata || { role: 'user' }
});

export default withAuth(AdminUsers, { requiredRole: 'admin' });

function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: users, error } = await createClient()
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
          setError(error.message);
          return;
        }

        setUsers(users || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred while fetching users';
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        });
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole }
      });

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, app_metadata: { ...u.app_metadata, role: newRole } }
          : u
      ));

      toast({
        title: "Success",
        description: "User role updated successfully",
        variant: "default"
      });
    } catch (err) {
      console.error('Error updating user role:', err);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Manage Users</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={u.app_metadata?.role || 'user'}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}