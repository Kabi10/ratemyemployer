'use client'

import { useRouter } from 'next/navigation';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function PermissionDeniedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <CardTitle className="text-2xl text-red-700">Access Denied</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                You don't have the necessary permissions to access this page. This area is restricted to users with higher permission levels.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
                <p>
                  If you believe you should have access to this page, please contact an administrator or check your account settings.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-gray-100 pt-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home Page
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 