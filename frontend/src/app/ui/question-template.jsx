export default function QuestionTemplate({ question, calculation }) {
  return (
    <div>
      <p className="text-center">{question}</p>
      <p className="text-xl text-center">{calculation}</p>
    </div>
  );
}
