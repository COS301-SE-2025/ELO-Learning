export default function MotivationTips({ motivationData }) {
  return (
    <section className="w-screen snap-center flex-shrink-0 px-6">
      <h2 className="text-xl font-semibold mb-2 text-[var(--color-foreground)] text-center">
        Motivation & Tips
      </h2>
      <div className="bg-gray-900 rounded-xl p-4">
        {motivationData.motivation ? (
          <div>
            <p className="text-xl md:text-2xl font-semibold text-[var(--radical-rose)] mb-4 text-center">
              {motivationData.motivation}
            </p>
            <ul className="list-disc pl-5 text-white space-y-1">
              {motivationData.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-400 text-center">No motivation tips yet.</p>
        )}
      </div>
    </section>
  );
}
