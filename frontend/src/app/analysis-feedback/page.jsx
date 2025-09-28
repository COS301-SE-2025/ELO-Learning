'use client';

import {
  fetchUserAccuracy,
  fetchUserMotivationTips,
  fetchUserTopicDepth,
  fetchUserTopicStats,
} from '@/services/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccuracyChart from '../ui/analytics/accuracy-chart';
import BestTopicsChart from '../ui/analytics/best-topics-chart';
import MotivationTips from '../ui/analytics/motivation-tips';
import TopicDepthTable from '../ui/analytics/topic-depth-table';
import WorstTopicsChart from '../ui/analytics/worst-topics-chart';
import Back from '../ui/back'; // added import

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
  const [bestTopicFeedback, setBestTopicFeedback] = useState('');
  const [worstTopicFeedback, setWorstTopicFeedback] = useState('');
  const [topicDepth, setTopicDepth] = useState(null);
  const [coverageFeedback, setCoverageFeedback] = useState('');
  const [motivationData, setMotivationData] = useState({
    motivation: '',
    tips: [],
  });

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
        const topicDepthRes = await fetchUserTopicDepth(userId); // new API endpoint

        if (topicDepthRes?.success) {
          setTopicDepth(topicDepthRes.topicDepth || []);
          setCoverageFeedback(topicDepthRes.depthFeedback || '');
        }

        const motivationRes = await fetchUserMotivationTips(userId);

        if (motivationRes?.success) {
          setMotivationData({
            motivation: motivationRes.motivation || '',
            tips: motivationRes.tips || [],
          });
        }

        // Generate topic feedback
        if (topicRes.bestTopics?.length > 0) {
          const best = topicRes.bestTopics;
          const topAcc = best[0].accuracy;

          // Find all topics tied with topAcc
          const tied = best.filter((t) => t.accuracy === topAcc);

          if (tied.length > 1) {
            // Multiple topics tied for best
            const sentences = tied.map(
              (t) =>
                `You're strongest in "${t.topic}" with ${topAcc.toFixed(1)}%.`,
            );
            setBestTopicFeedback(`${sentences.join(' ')} Keep it up!`);
          } else {
            // Mention all 3 if available
            const sentences = best
              .slice(0, 3)
              .map(
                (t, i) =>
                  `You did well in "${t.topic}" with ${t.accuracy.toFixed(
                    1,
                  )}%.`,
              );
            setBestTopicFeedback(`${sentences.join(' ')} Great work!`);
          }
        }

        if (topicRes.worstTopics?.length > 0) {
          const worst = topicRes.worstTopics;
          const bottomAcc = worst[0].accuracy;

          // Find all tied for worst
          const tied = worst.filter((t) => t.accuracy === bottomAcc);

          if (tied.length > 1) {
            const names = tied.map((t) => `"${t.topic}"`).join(' and ');
            setWorstTopicFeedback(
              `Your weakest areas are ${names}, all with ${bottomAcc.toFixed(
                1,
              )}%.\n💡 Tips:\n• Review notes on these topics.\n• Practice small problems daily.\n• Revisit mistakes from past attempts.`,
            );
          } else {
            const parts = worst
              .slice(0, 3)
              .map(
                (t, i) =>
                  `${i === 0 ? 'your weakest' : i === 1 ? 'then' : 'and'} "${
                    t.topic
                  }" with ${t.accuracy.toFixed(1)}%`,
              );
            setWorstTopicFeedback(
              `You need to work on ${parts.join(
                ', ',
              )}.\n💡 Tips:\n• Review notes\n• Practice daily\n• Revisit mistakes`,
            );
          }
        }

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
    <div
      className=""
      style={{ minHeight: '100vh', height: '100vh', position: 'relative' }}
    >
      {/* Header: sticky, bordered to match other pages */}

      <Back pagename="Statistics" />

      <div className="">
        <div className="">
          {/* Scrollable content with extra bottom padding so overlay doesn't overlap */}
          <div
            id="analysis-scroll"
            className="overflow-y-auto h-full pb-32"
            style={{
              width: '100%',
              maxHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Accuracy Section */}
            <AccuracyChart
              loading={loading}
              error={error}
              accuracyData={accuracyData}
              feedback={feedback}
              formatDate={formatDate}
              yTickFormatter={yTickFormatter}
              tooltipFormatter={tooltipFormatter}
            />
            <div className="border border-[#696969] my-8 h-2 w-[90vw]"></div>

            {/* Best Topics Section */}
            <BestTopicsChart
              bestTopics={topicStats.bestTopics}
              bestTopicFeedback={bestTopicFeedback}
            />
            <div className="border border-[#696969] my-8 h-2 w-[90vw]"></div>

            {/* Worst Topics Section */}
            <WorstTopicsChart
              worstTopics={topicStats.worstTopics}
              worstTopicFeedback={worstTopicFeedback}
            />

            <div className="border border-[#696969] my-8 h-2 w-[90vw]"></div>

            {/* Topic Depth Section */}
            <TopicDepthTable
              topicDepth={topicDepth}
              coverageFeedback={coverageFeedback}
            />

            <div className="border border-[#696969] my-8 h-2 w-[90vw]"></div>

            {/* Motivation & Tips Section */}
            <MotivationTips motivationData={motivationData} />
          </div>
          {/* Practice Now button styled like question footer */}
          <div className="flex fixed bottom-0 left-0 w-full z-10 px-4 py-4 bg-[var(--color-background)]">
            <div className="flex flex-col justify-center md:m-auto max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => router.push('/practice')}
                className="w-full md:m-auto main-button"
              >
                Practice Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
