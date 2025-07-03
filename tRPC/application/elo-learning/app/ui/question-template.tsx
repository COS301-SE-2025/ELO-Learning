interface QuestionTemplateProps {
  question: string;
  // calculation?: string;
}
export default function QuestionTemplate({
  question,
}: // calculation,
QuestionTemplateProps) {
  return (
    <div>
      <p className="text-center text-xl font-bold my-15 mx-10 md:m-10">
        {question}
      </p>
      {/* <p className="text-xl text-center">{calculation}</p> */}
    </div>
  );
}
