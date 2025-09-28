import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function AccuracyChart({
  loading,
  error,
  accuracyData,
  feedback,
  formatDate,
  yTickFormatter,
  tooltipFormatter,
}) {
  return (
    <section className="w-screen snap-center flex-shrink-0 px-6">
      <h2 className="text-lg font-semibold mb-2 text-white text-center">
        Accuracy Over Time
      </h2>
      <div
        className="h-64 rounded-xl p-4"
        style={{
          background: 'var(--color-background)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-red-500">{error}</span>
          </div>
        ) : accuracyData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-gray-500">No accuracy data yet.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={accuracyData}
              margin={{ top: 0, right: 0, left: 0, bottom: 24 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="rgba(255,255,255,0.85)"
                tick={{ fill: '#ffffffcc', fontSize: 12 }}
                label={{
                  value: 'day',
                  position: 'bottom',
                  offset: 0,
                  dy: 8,
                  style: { fontSize: 14, fontWeight: '700', fill: '#fff' },
                }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={yTickFormatter}
                stroke="rgba(255,255,255,0.85)"
                tick={{ fill: '#ffffffcc', fontSize: 12 }}
              />
              <Tooltip
                labelFormatter={formatDate}
                formatter={tooltipFormatter}
                contentStyle={{
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 8,
                }}
                labelStyle={{ color: '#fff', fontWeight: 600 }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend
                wrapperStyle={{ color: '#fff' }}
                verticalAlign="top"
                align="center"
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="var(--radical-rose)"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#fff', strokeWidth: 1 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      {feedback && (
        <div className="mt-4">
          <p className="text-md font-semibold text-[var(--radical-rose)] mb-0">
            {feedback}
          </p>
        </div>
      )}
    </section>
  );
}
