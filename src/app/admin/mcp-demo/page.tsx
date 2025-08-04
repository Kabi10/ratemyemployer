'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { withAuth } from '@/lib/auth/withAuth';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { useAuth } from '@/contexts/AuthContext';

// Dynamically import the MCP demo component with SSR disabled
const MCPDemoComponent = dynamic(
  () => import('@/components/MCPDemoComponent'),
  { ssr: false }
);

export const metadata = {
  title: 'MCP Developer Tools | RateMyEmployer Admin',
  description: 'Model Context Protocol developer tools and testing interface',
};

function MCPDemoPage() {
  const { userRole } = useAuth();

  // Check if user has access to MCP demo
  if (!isFeatureEnabled('mcpDemo', userRole)) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h2>
            <p className="text-yellow-700">
              MCP Developer Tools are only available in development mode or for admin users.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">MCP Developer Tools</h1>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-blue-700">
              <strong>Developer Note:</strong> This interface is for testing and development of Model Context Protocol integration.
              MCP functionality is integrated transparently throughout the application to enhance user experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Integration Status</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>✅ MCP Server Configuration</li>
                <li>✅ Stored Procedures</li>
                <li>✅ Admin Analytics Integration</li>
                <li>✅ Wall of Fame/Shame Enhancement</li>
                <li>🔄 Smart Search (In Progress)</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Available Commands</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><code>npm run mcp:start</code> - Start MCP server</li>
                <li><code>npm run mcp:setup</code> - Setup MCP configuration</li>
                <li><code>npm run mcp:sample-queries</code> - Test queries</li>
                <li><code>npm run mcp:update-schema</code> - Update schema</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Suspense fallback={
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          }>
            <MCPDemoComponent />
          </Suspense>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAuth(MCPDemoPage, ['admin', 'moderator']);
