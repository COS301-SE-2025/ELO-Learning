export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <p className="text-white text-lg">Loading baseline assessment...</p>
      </div>
    </div>
  );
}
