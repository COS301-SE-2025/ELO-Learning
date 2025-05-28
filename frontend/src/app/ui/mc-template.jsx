export default function MCTemplate({ answers }) {
  return (
    <div className="flex flex-col gap-2 mt-4 items-center">
      {answers &&
        answers.map((answer, idx) => (
          <button
            key={idx}
            className="main-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-48"
          >
            {answer}
          </button>
        ))}
    </div>
  );
}
