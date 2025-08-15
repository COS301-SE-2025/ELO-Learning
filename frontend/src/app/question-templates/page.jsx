import { redirect } from 'next/navigation';

export default function QuestionTemplatesPage() {
  // Redirect to practice page since this isn't in your designs
  redirect('/practice');
}
