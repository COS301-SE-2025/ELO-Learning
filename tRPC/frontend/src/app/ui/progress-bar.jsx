export default function ProgressBar({ progress }) {
  return (
    <div className="progress-bar w-full h-2 rounded-full overflow-hidden relative">
      <div
        className="progress-filled h-full transition-all duration-300 relative"
        style={{ width: `${progress * 100}%` }}
      >
        <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-[85%] md:w-[95%] h-1/3 bg-white/30 rounded-full "></div>
      </div>
    </div>
  );
}
