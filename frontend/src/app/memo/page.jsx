import QuestionNumber from '@/app/ui/memo/question-num';
import RightAnswer from '@/app/ui/memo/right-answer';
import WrongAnswer from '@/app/ui/memo/wrong-answer';
import QuestionTemplate from '@/app/ui/question-template';
export default function Page() {
  return (
    <div className="full-screen w-full h-full flex flex-col justify-between">
      <div>
        <QuestionNumber index={1} />
      </div>
      <div>
        <QuestionTemplate question="The area of a triangle with base 10 cm and height 8 cm." />
      </div>
      <div className="md:flex md:flex-col md:m-auto md:w-[50%]">
        <div>
          <p className="text-xl">Your answer:</p>
          <WrongAnswer answer="30 cm²" />
        </div>
        <div>
          <p className="text-xl">System answer:</p>
          <RightAnswer answer="40 cm²" />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between w-full gap-4 md:w-[50%] md:m-auto">
        <button className="secondary-button">Previous</button>
        <button className="main-button">Next</button>
      </div>
    </div>
  );
}
