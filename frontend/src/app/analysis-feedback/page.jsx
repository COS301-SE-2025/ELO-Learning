'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavLinks from '../ui/nav-links';
import NavBar from '../ui/nav-bar';
import { fetchUserAccuracy } from '@/services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalysisFeedbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [accuracyData, setAccuracyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Accept either an array response or { accuracy: [...] }
        const dataArray = Array.isArray(res) ? res : res?.accuracy || [];

        // Normalize, convert fractions to percentages, sort by date
        const normalized = normalizeAndSortAccuracy(dataArray);

        setAccuracyData(normalized);
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
    <div className="max-w-7xl mx-auto p-6 pb-20">
      <div className="flex gap-6">
        <aside className="hidden md:block md:w-56">
          <NavLinks />
        </aside>

        <main className="flex-1">
          <button
            className="mb-4 text-sm text-blue-600"
            onClick={() => router.back()}
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold mb-4">Match Analysis</h1>

          {/* Accuracy Graph */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Accuracy Over Time</h2>

            <div className="h-64 border rounded p-4 bg-white">
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      label={{
                        value: 'day',
                        position: 'bottom', // place the label below the axis so it's not clipped
                        offset: 0,
                        dy: 8, // nudge label downward slightly
                      }}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={yTickFormatter}
                      label={{
                        value: 'accuracy',
                        angle: -90,
                        position: 'left', // place label outside axis
                        offset: 0,
                        dx: -12, // move label further left from the ticks
                      }}
                    />
                    <Tooltip
                      labelFormatter={formatDate}
                      formatter={tooltipFormatter}
                    />
                    <Legend verticalAlign="top" align="center" />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Mobile fixed navbar/footer (hidden on md+) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4">
          <NavBar />
        </div>
      </footer>
    </div>
  );
}
