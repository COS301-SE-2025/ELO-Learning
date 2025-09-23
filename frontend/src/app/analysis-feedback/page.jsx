'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavLinks from '../ui/nav-links';
import NavBar from '../ui/nav-bar';
import Back from '../ui/back'; // added import
import { fetchUserAccuracy, fetchUserTopicStats } from '@/services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function AnalysisFeedbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [accuracyData, setAccuracyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [topicStats, setTopicStats] = useState({
    bestTopics: [],
    worstTopics: [],
  });

  // Helper: normalize / format incoming accuracy items
  function normalizeAndSortAccuracy(raw) {
    if (!Array.isArray(raw)) return [];

    const normalized = raw
      .map((item) => {
        // Accept multiple possible field names
        const rawDate =
          item.date || item.attemptDate || item.timestamp || item.day || null;

        // Accept backend's accuracy_percentage and also derive from correct/total attempts
        let rawAcc =
          item.accuracy ??
          item.accuracy_pct ??
          item.percentage ??
          item.accuracy_percentage ??
          item.value ??
          item.score ??
          null;

        // If explicit accuracy not provided, try compute from attempts
        if (
          rawAcc === null &&
          item.correct_attempts != null &&
          item.total_attempts != null
        ) {
          const total = Number(item.total_attempts);
          const correct = Number(item.correct_attempts);
          if (Number.isFinite(total) && total > 0 && Number.isFinite(correct)) {
            rawAcc = (correct / total) * 100;
          } else {
            rawAcc = 0;
          }
        }

        if (rawAcc === null || rawDate === null) return null;

        if (typeof rawAcc === 'string') {
          const parsed = parseFloat(rawAcc.replace('%', '').trim());
          if (!Number.isFinite(parsed)) return null;
          rawAcc = parsed;
        }

        // If value looks like 0..1 convert to 0..100
        if (typeof rawAcc === 'number' && rawAcc <= 1 && rawAcc >= 0) {
          rawAcc = rawAcc * 100;
        }

        const parsedDate = new Date(rawDate);
        if (isNaN(parsedDate.getTime())) return null;

        // Use ISO date for stable X-axis labels
        const date = parsedDate.toISOString().split('T')[0];

        return {
          date,
          accuracy: Math.max(0, Math.min(100, Number(rawAcc))),
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return normalized;
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      // Wait until auth status resolves
      if (status === 'loading') return;

      try {
        if (status !== 'authenticated' || !session?.user?.id) {
          // Not authenticated -> nothing to load
          setAccuracyData([]);
          setLoading(false);
          return;
        }

        const userId = session.user.id;
        const res = await fetchUserAccuracy(userId);
        const topicRes = await fetchUserTopicStats(userId);
        setTopicStats(topicRes);

        // Accept either an array response or { accuracy: [...] }
        const dataArray = Array.isArray(res) ? res : res?.accuracy || [];

        // Normalize, convert fractions to percentages, sort by date
        const normalized = normalizeAndSortAccuracy(dataArray);

        setAccuracyData(normalized);

        // --- FEEDBACK LOGIC ---
        if (normalized.length === 0) {
          setFeedback(
            'No data yet. Start answering questions to see your progress!',
          );
        } else {
          const first = normalized[0].accuracy;
          const last = normalized[normalized.length - 1].accuracy;
          const avg =
            normalized.reduce((sum, item) => sum + item.accuracy, 0) /
            normalized.length;

          if (last > first && last >= 80) {
            setFeedback(
              `Great job! Your accuracy has improved from ${first.toFixed(
                1,
              )}% to ${last.toFixed(1)}%!`,
            );
          } else if (last < first) {
            setFeedback(
              `Your accuracy dropped from ${first.toFixed(
                1,
              )}% to ${last.toFixed(1)}%. Keep practicing!`,
            );
          } else if (avg >= 80) {
            setFeedback(
              `You're consistent with high accuracy (${avg.toFixed(1)}%)!`,
            );
          } else {
            setFeedback(
              `Your average accuracy is ${avg.toFixed(
                1,
              )}%. Keep practicing to improve!`,
            );
          }
        }
      } catch (err) {
        console.error('Error fetching accuracy data:', err);
        setError('Failed to load accuracy data.');
        setAccuracyData([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [status, session?.user?.id]);

  // Helper: format ISO date -> "11 Sep 2025"
  function formatDate(dateStr) {
    try {
      // If already a Date object, use it; otherwise construct Date from string
      const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
    } catch (e) {
      return dateStr;
    }
  }

  // Small formatters
  const yTickFormatter = (val) => `${Math.round(val)}%`;
  const tooltipFormatter = (value) =>
    value !== undefined && value !== null ? `${Math.round(value)}%` : value;

  return (
    <div className="max-w-7xl mx-auto p-0 pb-20">
      {/* Header: sticky, bordered to match other pages */}
      <div
        className="sticky top-0 z-10 px-4 py-4 border-b border-gray-700"
        style={{ background: 'var(--color-background)' }}
      >
        <Back pagename="Statistics" />
      </div>

      <div className="p-6">
        <div className="flex gap-6">
          <aside className="hidden md:block md:w-56">
            <NavLinks />
          </aside>

          <main className="flex-1">
            {/* Wrapper: horizontal scroll between Accuracy and Topics */}
            <div className="relative">
              {/* Left arrow */}
              <button
                onClick={() => {
                  document
                    .getElementById('analysis-scroll')
                    ?.scrollBy({
                      left: -window.innerWidth,
                      behavior: 'smooth',
                    });
                }}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#7d32ce] text-white p-2 rounded-full shadow-lg hover:bg-[#651fa0]"
              >
                ←
              </button>

              {/* Scrollable content */}
              <div
                id="analysis-scroll"
                className="flex overflow-x-auto scroll-smooth w-full h-full snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none' }}
              >
                {/* Accuracy Section */}
                <section className="min-w-full snap-center px-6">
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
                        <span className="text-sm text-gray-500">
                          Loading...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-sm text-red-500">{error}</span>
                      </div>
                    ) : accuracyData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-sm text-gray-500">
                          No accuracy data yet.
                        </span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={accuracyData}
                          margin={{ top: 0, right: 0, left: 48, bottom: 28 }}
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
                              style: {
                                fontSize: 14,
                                fontWeight: '700',
                                fill: '#fff',
                              },
                            }}
                            padding={{ left: 10, right: 10 }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tickFormatter={yTickFormatter}
                            stroke="rgba(255,255,255,0.85)"
                            tick={{ fill: '#ffffffcc', fontSize: 12 }}
                            label={{
                              value: 'accuracy',
                              angle: -90,
                              position: 'left',
                              offset: 0,
                              dx: -12,
                              style: {
                                fontSize: 14,
                                fontWeight: '700',
                                fill: '#fff',
                              },
                            }}
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
                            stroke="#FF6E99"
                            strokeWidth={3}
                            dot={{ r: 4, stroke: '#fff', strokeWidth: 1 }}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Feedback below the chart */}
                  {feedback && (
                    <div className="mt-4 text-center">
                      <p className="text-xl md:text-2xl font-semibold text-pink-400 mb-4">
                        {feedback}
                      </p>

                      <button
                        onClick={() => router.push('/practice')}
                        className="px-6 py-3 bg-[#7d32ce] hover:bg-[#651fa0] text-white font-semibold rounded-lg transition-colors"
                      >
                        Practice Now
                      </button>
                    </div>
                  )}
                </section>

                {/* Best Topics Section */}
                <section className="min-w-full snap-center px-6">
                  <h2 className="text-lg font-semibold mb-2 text-white text-center">
                    Best Topics
                  </h2>
                  <div className="bg-gray-900 rounded-xl p-4">
                    {topicStats.bestTopics.length === 0 ? (
                      <p className="text-gray-400 text-center">No data yet.</p>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topicStats.bestTopics}
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
                            <Tooltip
                              formatter={(val) => `${Number(val).toFixed(1)}%`}
                            />
                            <Bar
                              dataKey="accuracy"
                              fill="#34d399"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </section>

                {/* Worst Topics Section */}
                <section className="min-w-full snap-center px-6">
                  <h2 className="text-lg font-semibold mb-2 text-white text-center">
                    Worst Topics
                  </h2>
                  <div className="bg-gray-900 rounded-xl p-4">
                    {topicStats.worstTopics.length === 0 ? (
                      <p className="text-gray-400 text-center">No data yet.</p>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topicStats.worstTopics}
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
                            <Tooltip
                              formatter={(val) => `${Number(val).toFixed(1)}%`}
                            />
                            <Bar
                              dataKey="accuracy"
                              fill="#f87171"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right arrow */}
              <button
                onClick={() => {
                  document
                    .getElementById('analysis-scroll')
                    ?.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#7d32ce] text-white p-2 rounded-full shadow-lg hover:bg-[#651fa0]"
              >
                →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
