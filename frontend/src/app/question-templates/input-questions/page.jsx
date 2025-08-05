import MathKeyboardWrapper from '@/app/ui/math-keyboard/client-wrapper';
import { getQuestionsByType } from '@/utils/api'; // NEW API

export default async function Page() {
  const result = await getQuestionsByType('Math Input'); // Get only Math Input

  if (!result.success) {
    console.error('Error:', result.error);
    return (
      <div className="full-screen w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Error Loading Questions
          </h2>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  const questions = result.data || []; // ✅ Fallback to empty array

  // ✅ Check if we have questions
  if (questions.length === 0) {
    console.warn('No Math Input questions found');
    return (
      <div className="full-screen w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600">
            No Math Input questions found in the database.
          </p>
        </div>
      </div>
    );
  }

  console.log('Math Input questions fetched successfully:', questions.length);

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <MathKeyboardWrapper questions={questions} />
    </div>
  );
}
