"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const supabaseClient_1 = require("@/lib/supabaseClient");
const LoadingSpinner_1 = require("@/components/LoadingSpinner");
const Toast_1 = require("@/components/Toast");
const AdminLayout_1 = require("@/components/layouts/AdminLayout");
const mapSupabaseUser = (user) => ({
    id: user.id,
    email: user.email || '',
    created_at: user.created_at,
    app_metadata: user.app_metadata || { role: 'user' }
});
function AdminUsers() {
    const { showToast } = (0, Toast_1.useToast)();
    const [users, setUsers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        async function fetchUsers() {
            try {
                const supabase = (0, supabaseClient_1.createClient)();
                const { data: { users: supabaseUsers }, error } = await supabase.auth.admin.listUsers();
                if (error)
                    throw error;
                setUsers((supabaseUsers || []).map(mapSupabaseUser));
            }
            catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users');
            }
            finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);
    const handleRoleChange = async (userId, newRole) => {
        try {
            const supabase = (0, supabaseClient_1.createClient)();
            const { error } = await supabase.auth.admin.updateUserById(userId, {
                user_metadata: { role: newRole }
            });
            if (error)
                throw error;
            setUsers(users.map(u => u.id === userId
                ? Object.assign(Object.assign({}, u), { app_metadata: Object.assign(Object.assign({}, u.app_metadata), { role: newRole }) }) : u));
            showToast('User role updated successfully', 'success');
        }
        catch (err) {
            console.error('Error updating user role:', err);
            showToast('Failed to update user role', 'error');
        }
    };
    if (loading) {
        return (<AdminLayout_1.AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner_1.LoadingSpinner size="lg"/>
        </div>
      </AdminLayout_1.AdminLayout>);
    }
    if (error) {
        return (<AdminLayout_1.AdminLayout>
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      </AdminLayout_1.AdminLayout>);
    }
    return (<AdminLayout_1.AdminLayout>
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
            {users.map(u => {
            var _a;
            return (<tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select value={((_a = u.app_metadata) === null || _a === void 0 ? void 0 : _a.role) || 'user'} onChange={e => handleRoleChange(u.id, e.target.value)} className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>);
        })}
          </tbody>
        </table>
      </div>
    </AdminLayout_1.AdminLayout>);
}
exports.default = AdminUsers;
