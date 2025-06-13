import ClientWrapper from '@/app/ui/client-wrapper';
import { practiceQuestion } from '@/utils/api';

export default async function Page() {
  const result = await practiceQuestion();
  if (result.success) {
    console.log('Questions fetched successfully');
  } else {
    console.error('Error:', result.error);
    return <div>Error loading questions</div>;
  }
  const questions = result.data;

  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <ClientWrapper questions={questions} />
    </div>
  );
}
