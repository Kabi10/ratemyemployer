'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ReviewForm } from '@/components/ReviewForm';
import { createClient } from '@/lib/supabaseClient';
import type { Company } from '@/types/database';

interface CompanyActionsProps {
  company: Company;
}

export function CompanyActions({ company }: CompanyActionsProps) {
  const [showAddReview, setShowAddReview] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleWriteReview = () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    setShowAddReview(true);
  };

  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={handleWriteReview}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Write a Review
        </Button>
      </div>

      {showAddReview && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowAddReview(false)}
            />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex animate-slide-in-right">
              <div className="relative w-screen max-w-2xl">
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Write a Review
                          </h2>
                          <p className="mt-1 text-sm text-gray-500">
                            for {company.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowAddReview(false)}
                        >
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="mt-6">
                        <ReviewForm
                          companyId={company.id}
                          onSuccess={() => {
                            setShowAddReview(false);
                            router.refresh();
                          }}
                          onSubmit={async (data) => {
                            try {
                              const supabase = createClient();
                              const { error } = await supabase
                                .from('reviews')
                                .insert({ ...data, company_id: company.id });
                              
                              if (error) throw error;
                              return Promise.resolve();
                            } catch (error) {
                              return Promise.reject(error);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}