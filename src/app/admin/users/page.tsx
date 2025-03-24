import { Metadata } from 'next';
import RoleManagement from '@/components/admin/RoleManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'User Management - Admin Dashboard',
  description: 'Manage user roles and permissions',
};

export default async function UserManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleManagement />
        </CardContent>
      </Card>
    </div>
  );
}