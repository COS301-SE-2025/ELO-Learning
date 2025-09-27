import Lives from '../lives';
import ProgressBar from '../progress-bar';

export default function RoomStats({
  lives,
  xp,
  accuracy,
  questionIdx,
  totalQuestions,
}) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="flex flex-row items-center justify-between w-full py-2 gap-2">
        <ProgressBar progress={(questionIdx + 1) / totalQuestions} />
        <Lives numberOfLives={lives} />
      </div>
      <div
        className="mb-2 text-lg font-bold"
        style={{ color: 'var(--foreground)' }}
      >
        XP: {xp}
      </div>
      <div
        className="mb-2 text-lg font-bold"
        style={{ color: 'var(--foreground)' }}
      >
        Accuracy: {(accuracy * 100).toFixed(1)}%
      </div>
      <div className="w-full mb-2"></div>
    </div>
  );
}
