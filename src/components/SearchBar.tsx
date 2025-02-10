'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewForm } from '@/components/ReviewForm';
import { CompanyForm } from '@/components/ui-library/CompanyForm';
import { supabase } from '@/lib/supabaseClient';

export function SearchBar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formType, setFormType] = useState<'review' | 'company' | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      // Check if company exists
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .single();

      if (data) {
        setSelectedCompany(data);
        setFormType('review');
      } else {
        setFormType('company');
      }
      setIsFormVisible(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleClose = () => {
    setIsFormVisible(false);
    setFormType(null);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSearch}
        className="w-full flex flex-col md:flex-row gap-2 md:gap-4"
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-4 text-lg rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          placeholder="Search companies..."
        />
        <button
          type="submit"
          className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Search
        </button>
      </form>

      <AnimatePresence>
        {isFormVisible && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl p-6 overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              ✕
            </button>

            {formType === 'review' && selectedCompany && (
              <ReviewForm
                companyId={selectedCompany.id}
                onSuccess={() => {
                  handleClose();
                  router.refresh();
                }}
              />
            )}

            {formType === 'company' && (
              <CompanyForm
                initialData={{ name: searchTerm }}
                onSuccess={() => {
                  handleClose();
                  router.refresh();
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
