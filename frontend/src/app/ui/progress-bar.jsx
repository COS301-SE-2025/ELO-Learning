export default function ProgressBar({ progress }) {
  return (
    <div className="progress-bar w-full h-2 bg-gray-300 rounded-full overflow-hidden">
      <div
        className="progress-filled bg-black h-full transition-all duration-300"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
