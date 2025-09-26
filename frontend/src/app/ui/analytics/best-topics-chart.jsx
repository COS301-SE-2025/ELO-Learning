import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function BestTopicsChart({ bestTopics, bestTopicFeedback }) {
  return (
    <section className="w-screen snap-center flex-shrink-0 px-6">
      <h2 className="text-lg font-semibold mb-2 text-white text-center">
        Best Topics
      </h2>
      <div className="bg-gray-900 rounded-xl p-4">
        {bestTopics.length === 0 ? (
          <p className="text-gray-400 text-center">No data yet.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bestTopics}
                margin={{ top: 8, right: 8, left: 8, bottom: 24 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="topic"
                  tick={{ fill: '#fff', fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#fff', fontSize: 12 }}
                  tickFormatter={(v) => `${Math.round(v)}%`}
                />
                <Tooltip formatter={(val) => `${Number(val).toFixed(1)}%`} />
                <Bar dataKey="accuracy" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {bestTopicFeedback && (
        <div className="mt-4">
          <p className="text-md font-semibold text-green-400">
            {bestTopicFeedback}
          </p>
        </div>
      )}
    </section>
  );
}
