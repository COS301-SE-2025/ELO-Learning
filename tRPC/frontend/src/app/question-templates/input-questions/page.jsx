import MathKeyboardWrapper from '@/app/ui/math-keyboard/client-wrapper';
import { getQuestionsByType } from '@/utils/api'; // NEW API

export default async function Page() {
  const result = await getQuestionsByType('Math Input'); // Get only Math Input

  if (result.success) {
    console.log('Math Input questions fetched successfully');
  } else {
    console.error('Error:', result.error);
    return <div>Error loading input questions</div>;
  }

  const questions = result.data;

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <MathKeyboardWrapper questions={questions} />
    </div>
  );
}
