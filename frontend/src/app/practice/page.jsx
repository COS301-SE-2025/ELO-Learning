'use client';

import SubCategories from '@/app/ui/subcategories';
import { fetchAllTopics } from '@/services/api';
import { useEffect, useState } from 'react';

export default function Page() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await fetchAllTopics();
        setTopics(data);
      } catch (error) {
        console.error('Failed to load topics:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading topics...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl text-center py-10 md:py-5 mt-10 md:mt-0">
        Practice some maths!
      </h1>
      <div className="w-full">
        <SubCategories subcategories={topics} />
      </div>
    </div>
  );
}