'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { StarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Review, Company } from '@/types';

interface ReviewWithCompany extends Review {
  company: Company;
}

export default function AccountPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserReviews() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(
            `
            *,
            company:companies(*)
          `
          )
          .eq('user_id', user.id);

        if (error) throw error;
        setReviews(data as ReviewWithCompany[]);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserReviews();
  }, [user?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Link
                  href={`/companies/${review.company_id}`}
                  className="text-lg font-semibold hover:text-blue-600"
                >
                  {review.company.name}
                </Link>
                <div className="text-sm text-gray-600 mt-1">
                  {review.position} • {review.employment_status}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link href={`/reviews/${review.id}/edit`}>
                  <PencilIcon className="h-5 w-5 text-gray-500 hover:text-blue-600" />
                </Link>
                <button
                  onClick={() => {
                    /* Add delete handler */
                  }}
                >
                  <TrashIcon className="h-5 w-5 text-gray-500 hover:text-red-600" />
                </button>
              </div>
            </div>
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-semibold mb-2">{review.title}</h3>
            <p className="text-gray-700 mb-4">{review.content}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-600 mb-1">Pros</h4>
                <p className="text-sm text-gray-600">{review.pros || 'None provided'}</p>
              </div>
              <div>
                <h4 className="font-medium text-red-600 mb-1">Cons</h4>
                <p className="text-sm text-gray-600">{review.cons || 'None provided'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
