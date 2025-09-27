import { fetchUserAccuracy, fetchUserTopicStats } from '@/services/api';
import { getLatestAccuracy } from '@/utils/statsHelpers';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MatchStatsPreview() {
  const { data: session, status } = useSession();
  const [accuracy, setAccuracy] = useState(null);
  const [topicStats, setTopicStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const acc = await fetchUserAccuracy(session.user.id);
          console.log('DEBUG: fetchUserAccuracy result:', acc);
          const latestAccuracy = getLatestAccuracy(acc);
          const topics = await fetchUserTopicStats(session.user.id);
          setAccuracy(latestAccuracy);
          setTopicStats(topics ?? null);
        } catch (err) {
          setAccuracy(null);
          setTopicStats(null);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchStats();
  }, [session?.user?.id, status]);

  if (loading) {
    return (
      <div className="p-4 my-2">
        <div className="flex justify-center items-center py-8">
          <div className="text-center text-gray-400">Loading statistics...</div>
        </div>
      </div>
    );
  }

  // Helper to truncate words to 8 chars max, add ellipsis if longer
  const truncateWord = (word) => {
    if (!word) return '--';
    return word.length > 8 ? word.slice(0, 8) + '…' : word;
  };

  // Get best topic name
  const bestTopicRaw = topicStats?.bestTopics?.[0]
    ? typeof topicStats.bestTopics[0] === 'object'
      ? (
          topicStats.bestTopics[0].topic ||
          topicStats.bestTopics[0].name ||
          ''
        ).split(' ')[0]
      : typeof topicStats.bestTopics[0] === 'string'
        ? topicStats.bestTopics[0].split(' ')[0]
        : ''
    : '';
  const bestTopic = bestTopicRaw ? truncateWord(bestTopicRaw) : '--';

  // Get worst topic name
  const worstTopicRaw = topicStats?.worstTopics?.[0]
    ? typeof topicStats.worstTopics[0] === 'object'
      ? (
          topicStats.worstTopics[0].topic ||
          topicStats.worstTopics[0].name ||
          ''
        ).split(' ')[0]
      : typeof topicStats.worstTopics[0] === 'string'
        ? topicStats.worstTopics[0].split(' ')[0]
        : ''
    : '';
  const worstTopic = worstTopicRaw ? truncateWord(worstTopicRaw) : '--';

  return (
    <div className="p-4 my-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl uppercase font-bold">MATCH STATISTICS</h3>
        <Link
          href="/analysis-feedback"
          className="text-lg font-bold uppercase"
          style={{ color: '#FF6E99' }}
          aria-label="View match stats"
        >
          VIEW ALL
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-0 border border-[#696969] rounded-xl overflow-hidden">
        <div className="flex flex-col justify-between items-center pt-6 border-r border-[#696969] p-3 h-[120px]">
          <span className="text-xl font-bold text-[var(--color-foreground)] max-w-xs truncate">
            {typeof accuracy === 'number' ? `${accuracy}%` : '--'}
          </span>
          <span className="text-base text-[var(--color-foreground)]/80 mb-2 mt-auto">
            Accuracy
          </span>
        </div>
        <div className="flex flex-col justify-between items-center pt-6 border-r border-[#696969] p-3 h-[120px]">
          <span className="text-xl font-bold text-center text-[var(--color-foreground)] max-w-xs truncate">
            {bestTopic}
          </span>
          <span className="text-base text-[var(--color-foreground)]/80 mb-2 mt-auto">
            Best Topic
          </span>
        </div>
        <div className="flex flex-col justify-between items-center pt-6 p-3 h-[120px]">
          <span className="text-xl font-bold text-center text-[var(--color-foreground)] max-w-xs truncate">
            {worstTopic}
          </span>
          <span className="text-base text-[var(--color-foreground)]/80 mb-2 mt-auto">
            Needs Work
          </span>
        </div>
      </div>
    </div>
  );
}
