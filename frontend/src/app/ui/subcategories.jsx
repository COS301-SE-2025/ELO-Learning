const subcategories = [
  {
    title: 'Statistics',
    description:
      'Learn about data analysis, probability, and statistical inference.',
    completion: 75,
  },
  {
    title: 'Algebra',
    description: 'Master equations, inequalities, and algebraic structures.',
    completion: 40,
  },
  {
    title: 'Geometry',
    description: 'Explore shapes, sizes, and spatial properties.',
    completion: 0,
  },
  {
    title: 'Calculus',
    description:
      'Understand change and motion through derivatives and integrals.',
    completion: 0,
  },
  {
    title: 'Trigonometry',
    description: 'Study relationships between angles and sides of triangles.',
    completion: 0,
  },
  {
    title: 'Probability',
    description: 'Explore chance, randomness, and likelihood of events.',
    completion: 0,
  },
  {
    title: 'Number Theory',
    description: 'Discover properties of integers and whole numbers.',
    completion: 0,
  },
  {
    title: 'Discrete Mathematics',
    description:
      'Examine countable structures like graphs, logic, and combinatorics.',
    completion: 0,
  },
  {
    title: 'Linear Algebra',
    description: 'Work with vectors, matrices, and linear transformations.',
    completion: 0,
  },
  {
    title: 'Differential Equations',
    description:
      'Solve equations involving derivatives and their applications.',
    completion: 0,
  },
];

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

export default function SubCategories() {
  return (
    <div className="p-5">
      {subcategories.map((sub, idx) => (
        <div
          className="sub_categories flex flex-row items-center w-full p-4 gap-2"
          key={idx}
        >
          <div
            className={`flex items-center justify-center min-w-16 min-h-16 w-16 h-16 flex-shrink-0 rounded mr-4 text-white text-2xl font-bold ${
              colors[idx % colors.length]
            }`}
          >
            {sub.title.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{sub.title}</h2>
            <p className="text-sm">{sub.description}</p>
          </div>
          <p className="text-lg ml-auto">{sub.completion}%</p>
        </div>
      ))}
    </div>
  );
}
