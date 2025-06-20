'use client';
import { X } from 'lucide-react';
import Link from 'next/link';
export default function QuestionNumber({ index }) {
  return (
    <div className="flex flex-row items-center justify-start w-full">
      <Link href="/dashboard">
        <X size={24} />
      </Link>
      <div className="text-2xl font-bold ml-10">Question {index}</div>
    </div>
  );
}
