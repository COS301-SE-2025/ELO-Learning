export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-row items-center justify-center gap-5 mb-6">
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
            style={{ animationDelay: `${delay}ms` }}
          ></div>
        ))}
      </div>
      <div className="text-xl font-bold text-center mb-2">
        Loading Your Baseline Test...
      </div>
      <div className="text-sm text-center max-w-md opacity-70">
        We're setting up personalized questions to assess your current skill
        level
      </div>
    </div>
  );
}
