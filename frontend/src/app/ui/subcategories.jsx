import Link from 'next/link';

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-gray-500',
];

export default function SubCategories({ subcategories }) {
  return (
    <div className="p-5">
      {subcategories.map((sub, idx) => (
        <div
          className="sub_categories flex flex-row items-center w-full p-4 gap-2"
          key={idx}
        >
          <div
            className={`flex items-center justify-center min-w-16 min-h-16 w-16 h-16 flex-shrink-0 rounded mr-4 text-2xl font-bold ${
              colors[idx % colors.length]
            }`}
          >
            {sub.name.charAt(0)}
          </div>
          <Link href="/question-templates/multiple-choice/">
            <div>
              <h2 className="text-xl font-bold">{sub.name}</h2>
              <p className="text-sm">{sub.description}</p>
            </div>
            {/* <p className="text-lg ml-auto">{sub.completion}%</p> */}
          </Link>
        </div>
      ))}
    </div>
  );
}
