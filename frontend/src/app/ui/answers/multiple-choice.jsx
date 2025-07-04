export default function MultipleChoiceTemplate({
  answers,
  setSelectedAnswer,
  setIsSelectedAnswerCorrect,
}) {
  return (
    <div className="flex flex-col gap-10 md:gap-2 items-center">
      {answers &&
        answers.map((answer, idx) => (
          <button
            onClick={() => {
              setSelectedAnswer(answer.answer_text);
              setIsSelectedAnswerCorrect(answer.isCorrect);
            }}
            key={idx}
            className="mc-button px-4 py-5 w-48"
          >
            {answer.answer_text}
          </button>
        ))}
    </div>
  );
}
