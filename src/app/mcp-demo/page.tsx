import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the MCP demo component with SSR disabled
const MCPDemoComponent = dynamic(
  () => import('@/components/MCPDemoComponent'),
  { ssr: false }
);

export const metadata = {
  title: 'MCP Demo | RateMyEmployer',
  description: 'Demonstration of the Model Context Protocol integration with RateMyEmployer',
};

export default function MCPDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">MCP Integration Demo</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Home
          </Link>
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Model Context Protocol (MCP)</h2>
              <p className="mb-4">
                The Model Context Protocol (MCP) enables natural language interaction with your Supabase database through AI tools like Cursor.
              </p>
              <p className="mb-4">
                With MCP, you can query your database using plain English instead of SQL, get instant insights and data without context switching,
                and easily analyze company ratings, review trends, and user activity.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="text-blue-700">
                  <strong>Note:</strong> Make sure the MCP server is running with <code className="bg-gray-200 px-1 rounded">npm run mcp:start</code> to use the full capabilities of this demo.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2">Example Queries</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Show me all companies in the Technology industry</li>
                    <li>Find reviews with ratings lower than 3</li>
                    <li>What's the average rating across all companies?</li>
                    <li>Show me the most recent reviews</li>
                    <li>Which companies don't have any reviews yet?</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2">Benefits</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Query your database using natural language</li>
                    <li>Generate complex SQL queries without writing SQL</li>
                    <li>Explore your data more efficiently</li>
                    <li>Integrate AI-powered queries into your application</li>
                    <li>Improve developer productivity</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <Suspense fallback={<div className="p-6">Loading MCP Demo Component...</div>}>
                <MCPDemoComponent />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white shadow mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            For more information, see the <a href="/MCP_README.md" className="text-blue-500 hover:underline">MCP_README.md</a> file.
          </p>
        </div>
      </footer>
    </div>
  );
} 