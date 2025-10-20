'use client';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-row items-center justify-center gap-5">
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="animate-bounce rounded-full h-5 w-5 bg-[#FF6E99] mb-4"
            style={{ animationDelay: `${delay}ms` }}
          ></div>
        ))}
      </div>
      <div className="text-lg font-bold text-center">{message}</div>
    </div>
  );
}
