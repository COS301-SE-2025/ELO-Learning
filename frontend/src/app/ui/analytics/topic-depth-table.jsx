export default function TopicDepthTable({ topicDepth, coverageFeedback }) {
  return (
    <section className="w-screen snap-center flex-shrink-0 px-6">
      <h2 className="text-lg font-semibold mb-2 text-white text-center">
        Topic Depth
      </h2>
      <div className="bg-gray-900 rounded-xl p-4">
        {!topicDepth || topicDepth.length === 0 ? (
          <p className="text-gray-400 text-center">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-700 text-white">
              <thead>
                <tr>
                  <th className="border border-gray-600 px-2 py-1">Topic</th>
                  <th className="border border-gray-600 px-2 py-1">Attempts</th>
                  <th className="border border-gray-600 px-2 py-1">
                    Unique Questions
                  </th>
                  <th className="border border-gray-600 px-2 py-1">
                    Unique Types
                  </th>
                  <th className="border border-gray-600 px-2 py-1">
                    Avg Accuracy
                  </th>
                </tr>
              </thead>
              <tbody>
                {topicDepth.map((t) => (
                  <tr key={t.topic}>
                    <td className="border border-gray-600 px-2 py-1">
                      {t.topic}
                    </td>
                    <td className="border border-gray-600 px-2 py-1">
                      {t.attempts}
                    </td>
                    <td className="border border-gray-600 px-2 py-1">
                      {t.uniqueQuestions}
                    </td>
                    <td className="border border-gray-600 px-2 py-1">
                      {t.uniqueTypes}
                    </td>
                    <td className="border border-gray-600 px-2 py-1">
                      {t.avgAccuracy.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {coverageFeedback && (
        <div className="mt-4">
          <p className="text-md font-semibold text-yellow-400 whitespace-pre-line">
            {coverageFeedback}
          </p>
        </div>
      )}
    </section>
  );
}
