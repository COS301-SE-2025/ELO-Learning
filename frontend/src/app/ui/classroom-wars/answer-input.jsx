import QuestionFooter from '../questions/question-footer';

export default function AnswerInput({ answer, setAnswer, onSubmit, disabled }) {
  return (
    <form
      className="w-full flex flex-col items-center mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled && answer) onSubmit();
      }}
    >
      <input
        type="text"
        placeholder="Your Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="w-full bg-transparent border mb-4 p-2 rounded"
        style={{
          border: '1px solid var(--grey)',
          borderRadius: '5px',
          color: 'var(--foreground)',
          background: 'var(--background)',
        }}
        disabled={disabled}
      />
      <QuestionFooter
        isDisabled={disabled || !answer}
        isSubmitting={false}
        submitAnswer={onSubmit}
      />
    </form>
  );
}
