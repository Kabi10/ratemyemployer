'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabaseClient';
import { Role, RoleChange } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { notFound } from 'next/navigation';
import { UserAppMetadata } from '@supabase/supabase-js';

interface UserDetails {
  id: string;
  email: string;
  role: Role;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: Record<string, any>;
  app_metadata: UserAppMetadata;
  email_confirmed_at: string | null;
  phone_confirmed_at: string | null;
  confirmed_at: string | null;
  phone: string | null;
  banned_until: string | null;
}

interface UserActivity {
  id: number;
  created_at: string;
  company: {
    name: string;
  };
}

export default async function UserDetailsPage({ params }: { params: { id: string } }) {
  if (!params?.id) {
    notFound();
  }

  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [roleHistory, setRoleHistory] = useState<RoleChange[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
          params.id
        );

        if (userError) throw userError;
        if (!user) throw new Error('User not found');

        const userDetails: UserDetails = {
          id: user.id,
          email: user.email || '',
          role: (user.app_metadata?.role || 'user') as Role,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at || null,
          user_metadata: user.user_metadata || {},
          app_metadata: user.app_metadata || { provider: 'email', role: 'user' },
          email_confirmed_at: user.email_confirmed_at || null,
          phone_confirmed_at: user.phone_confirmed_at || null,
          confirmed_at: user.confirmed_at || null,
          phone: user.phone || null,
          banned_until: null,
        };

        setUserDetails(userDetails);

        // Fetch user activities
        const { data: activitiesRaw, error: activitiesError } = await supabase
          .from('reviews')
          .select('id, created_at, company:companies(name)')
          .eq('reviewer_id', user.id)
          .order('created_at', { ascending: false });

        if (activitiesError) throw activitiesError;

        // Transform to our expected format using type assertions
        const transformedActivities: UserActivity[] = [];

        if (activitiesRaw) {
          for (const item of activitiesRaw) {
            // Force cast to any to avoid TypeScript errors with unknown structure
            const anyItem = item as any;
            
            transformedActivities.push({
              id: anyItem.id,
              created_at: anyItem.created_at,
              company: { 
                name: Array.isArray(anyItem.company) && anyItem.company.length > 0 
                  ? String(anyItem.company[0]?.name || 'Unknown')
                  : typeof anyItem.company === 'object' && anyItem.company 
                    ? String(anyItem.company.name || 'Unknown')
                    : 'Unknown'
              }
            });
          }
        }

        setActivities(transformedActivities);

        // Fetch role change history
        const { data: roleHistory, error: roleHistoryError } = await supabase
          .from('role_change_history_with_details')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (roleHistoryError) throw roleHistoryError;
        setRoleHistory(roleHistory || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch user data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleBanUser = async () => {
    if (!userDetails) return;

    try {
      const banUntil = new Date();
      banUntil.setDate(banUntil.getDate() + 30); // Ban for 30 days

      const { error } = await supabase.auth.admin.updateUserById(userDetails.id, {
        ban_duration: '30d',
      });

      if (error) throw error;

      setUserDetails({
        ...userDetails,
        banned_until: banUntil.toISOString(),
      });

      toast({
        title: 'Success',
        description: 'User has been banned for 30 days.',
      });
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to ban user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnbanUser = async () => {
    if (!userDetails) return;

    try {
      const { error } = await supabase.auth.admin.updateUserById(userDetails.id, {
        ban_duration: '0',
      });

      if (error) throw error;

      setUserDetails({
        ...userDetails,
        banned_until: null,
      });

      toast({
        title: 'Success',
        description: 'User has been unbanned.',
      });
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unban user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>User Not Found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="history">Role History</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="mt-2 grid gap-2">
                    <div>
                      <span className="font-medium">Email:</span> {userDetails.email}
                    </div>
                    <div>
                      <span className="font-medium">Role:</span>{' '}
                      <Badge variant={userDetails.role === 'admin' ? 'destructive' : userDetails.role === 'moderator' ? 'default' : 'secondary'}>
                        {userDetails.role}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Full Name:</span>{' '}
                      {userDetails.user_metadata.full_name || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{' '}
                      {userDetails.user_metadata.phone || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Company:</span>{' '}
                      {userDetails.user_metadata.company || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>{' '}
                      {userDetails.user_metadata.location || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>Posted a review for {activity.company.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(activity.created_at), 'PPp')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No recent activity</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Security Information</h3>
                <div className="mt-2 grid gap-2">
                  <div>
                    <span className="font-medium">Account Status:</span>{' '}
                    <Badge variant={userDetails.banned_until ? 'destructive' : 'default'}>
                      {userDetails.banned_until ? 'Account Banned' : 'Active'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Email Verified:</span>{' '}
                    {userDetails.email_confirmed_at ? (
                      <Badge variant="default">Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Not Verified</Badge>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Phone Verified:</span>{' '}
                    {userDetails.phone_confirmed_at ? (
                      <Badge variant="default">Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Not Verified</Badge>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Last Sign In:</span>{' '}
                    {userDetails.last_sign_in_at
                      ? format(new Date(userDetails.last_sign_in_at), 'PPp')
                      : 'Never'}
                  </div>
                  <div>
                    <span className="font-medium">Account Created:</span>{' '}
                    {format(new Date(userDetails.created_at), 'PPp')}
                  </div>
                  <div>
                    <span className="font-medium">Authentication Provider:</span>{' '}
                    {userDetails.app_metadata.provider}
                  </div>
                </div>

                <div className="mt-6">
                  {userDetails.banned_until ? (
                    <Button
                      variant="default"
                      onClick={handleUnbanUser}
                    >
                      Unban User
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={handleBanUser}
                    >
                      Ban User
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Role Change History</h3>
                {roleHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Changed By</TableHead>
                        <TableHead>Previous Role</TableHead>
                        <TableHead>New Role</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roleHistory.map((change) => (
                        <TableRow key={change.id}>
                          <TableCell>{change.changed_by_email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{change.previous_role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{change.new_role}</Badge>
                          </TableCell>
                          <TableCell>{change.reason || '-'}</TableCell>
                          <TableCell>{format(new Date(change.created_at), 'PPp')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>No role change history</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 
