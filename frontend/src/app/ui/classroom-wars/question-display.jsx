export default function QuestionDisplay({ questionText }) {
  return (
    <div className="mb-6 text-center">
      <div
        className="mb-2 font-semibold text-xl"
        style={{ color: 'var(--foreground)' }}
      >
        {questionText || 'No question'}
      </div>
    </div>
  );
}
