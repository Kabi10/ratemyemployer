"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const useAuth_1 = require("@/hooks/useAuth");
const date_1 = require("@/utils/date");
function ProfilePage() {
    const { user } = (0, useAuth_1.useAuth)();
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!user)
            return;
        const fetchProfile = async () => {
            try {
                const response = await fetch(`/api/users/${user.id}/profile`);
                if (!response.ok)
                    throw new Error('Failed to fetch profile');
                const data = await response.json();
                setProfile({
                    id: data.id,
                    email: data.email || '',
                    username: data.username,
                    role: data.role,
                    is_verified: data.is_verified,
                    created_at: data.created_at,
                    updated_at: data.updated_at || data.created_at
                });
            }
            catch (error) {
                setError(error instanceof Error ? error : new Error('An error occurred'));
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [user]);
    if (!user) {
        return (<div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-gray-600">Please log in to view your profile.</p>
          </div>
        </div>
      </div>);
    }
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-red-600">Error: {error.message}</p>
          </div>
        </div>
      </div>);
    }
    if (!profile) {
        return (<div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-gray-600">Profile not found.</p>
          </div>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{profile.username || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{profile.role || 'User'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-medium">{(0, date_1.formatDateDisplay)(profile.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{(0, date_1.formatDateDisplay)(profile.updated_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verification Status</p>
                  <p className="font-medium">
                    {profile.is_verified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
exports.default = ProfilePage;
