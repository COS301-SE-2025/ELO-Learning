import { Check } from 'lucide-react';

interface AnswerProps {
  answer: string;
}

export default function RightAnswer({ answer }: AnswerProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-row w-full items-center justify-between bg-[#309F04] text-black p-5 rounded-lg mb-10 mt-5">
        <Check size={28} />
        <div className="w-[80%]">
          <p className="text-center text-2xl">{answer}</p>
        </div>
      </div>
    </div>
  );
}
