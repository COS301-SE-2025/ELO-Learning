import SubCategories from '@/app/ui/subcategories';
export default function Page() {
  return (
    <div>
      <h1 className="text-3xl text-center py-10 md:py-5">
        Practice some maths!
      </h1>
      <div className="w-full">
        <SubCategories />
      </div>
    </div>
  );
}
