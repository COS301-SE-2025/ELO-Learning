import { X } from 'lucide-react';

interface AnswerProps {
  answer: string;
}

export default function WrongAnswer({ answer }: AnswerProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-row w-full items-center justify-between bg-[#FF6666] text-black p-5 rounded-lg mt-5 mb-10">
        <X size={28} />
        <div className="w-[80%]">
          <p className="text-center text-2xl">{answer}</p>
        </div>
      </div>
    </div>
  );
}
