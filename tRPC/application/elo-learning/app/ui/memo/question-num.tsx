'use client';
import { X } from 'lucide-react';
import Link from 'next/link';

interface QuestionNumberProps {
  index: number;
}

export default function QuestionNumber({ index }: QuestionNumberProps) {
  return (
    <div className="flex flex-row items-center justify-start w-full">
      <Link href="/dashboard">
        <X size={24} />
      </Link>
      <div className="text-2xl font-bold ml-10">Question {index}</div>
    </div>
  );
}
