'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabaseClient';
import { Role } from '@/types';
import { Loader2, Search, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  role: Role;
  created_at: string;
  last_sign_in_at: string | null;
}

interface RoleChange {
  id: string;
  user_email: string;
  changed_by_email: string;
  previous_role: string;
  new_role: string;
  reason: string | null;
  created_at: string;
}

export default function RoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role | null>(null);
  const [reason, setReason] = useState('');
  const [roleChangeHistory, setRoleChangeHistory] = useState<RoleChange[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Fetch users on component mount
  useState(async () => {
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      setUsers(users.map(user => ({
        id: user.id,
        email: user.email!,
        role: (user.user_metadata?.role || 'user') as Role,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      })));

      // Fetch role change history
      const { data: history, error: historyError } = await supabase
        .from('role_change_history_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;
      setRoleChangeHistory(history);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user role
  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;
    
    setUpdating(selectedUser.id);
    try {
      const { error } = await supabase.auth.admin.updateUserById(selectedUser.id, {
        user_metadata: { role: newRole },
      });

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, role: newRole } : user
      ));

      // Fetch updated role change history
      const { data: history, error: historyError } = await supabase
        .from('role_change_history_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;
      setRoleChangeHistory(history);

      toast({
        title: 'Success',
        description: 'User role updated successfully.',
      });

      // Reset state
      setSelectedUser(null);
      setNewRole(null);
      setReason('');
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
        >
          <History className="mr-2 h-4 w-4" />
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>
      </div>

      {showHistory ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Previous Role</TableHead>
                <TableHead>New Role</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleChangeHistory.map((change) => (
                <TableRow key={change.id}>
                  <TableCell>{change.user_email}</TableCell>
                  <TableCell>{change.changed_by_email}</TableCell>
                  <TableCell>{change.previous_role}</TableCell>
                  <TableCell>{change.new_role}</TableCell>
                  <TableCell>{change.reason || '-'}</TableCell>
                  <TableCell>{format(new Date(change.created_at), 'PPp')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-32"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                          }}
                        >
                          {user.role}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update User Role</DialogTitle>
                          <DialogDescription>
                            Change the role for {user.email}. Please provide a reason for this change.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label>New Role</label>
                            <Select
                              value={newRole || user.role}
                              onValueChange={(value: Role) => setNewRole(value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <label>Reason for Change</label>
                            <Textarea
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="Please provide a reason for this role change..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(null);
                              setNewRole(null);
                              setReason('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleRoleUpdate}
                            disabled={!newRole || !reason || updating === user.id}
                          >
                            {updating === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Update Role'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>{format(new Date(user.created_at), 'PP')}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at
                      ? format(new Date(user.last_sign_in_at), 'PP')
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 