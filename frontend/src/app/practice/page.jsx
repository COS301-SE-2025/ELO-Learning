import SubCategories from '@/app/ui/subcategories';
import { fetchAllTopics } from '@/services/api';

// Force dynamic rendering since this page uses session data in the layout
export const dynamic = 'force-dynamic';

export default async function Page() {
  const topics = await fetchAllTopics();
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
