'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { generateOpenAIQuestion, approveOpenAIQuestion } from '@/services/api';
import LeaderboardTable from '../../ui/leaderboard-table';
import Header from '../../ui/header';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [full, setFull] = useState(null); // The full OpenAI question object
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [approved, setApproved] = useState(false);

  // Only allow admin
  if (
    status !== 'authenticated' ||
    session?.user?.email !== 'admin@gmail.com' ||
    session?.user?.username !== 'admin'
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Header />
        <h2 className="text-2xl font-bold mt-8">Access Denied</h2>
        <p className="mt-2">You do not have permission to view this page.</p>
        <Link href="/dashboard">
          <button className="btn btn-primary mt-4">Back to Dashboard</button>
        </Link>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setApproved(false);
    try {
      const data = await generateOpenAIQuestion();
      setFull(data.full || null);
      setQuestion(data.question || '');
      setAnswer(data.answer || '');
    } catch (err) {
      setError('Failed to generate question.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      // Send the full object for approval
      await approveOpenAIQuestion({ full });
      setApproved(true);
    } catch (err) {
      setError('Failed to approve question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-center">ADMIN DASHBOARD</h1>
      </div>
      <div className="flex flex-col flex-1 p-4 gap-4">
        {/* Editable OpenAI Question Object - always vertical */}
        {full ? (
          <div className="w-full flex flex-col gap-4">
            {Object.entries(full).map(([key, value]) => {
              if (key === 'answerChoices' && Array.isArray(value)) {
                return (
                  <div
                    key={key}
                    className="flex flex-col border border-[#696969] rounded-lg bg-[#18162a] p-4"
                  >
                    <label className="font-semibold mb-1">Answer Choices</label>
                    {value.map((choice, idx) => (
                      <div key={idx} className="flex items-center gap-4 mb-3">
                        <input
                          className="flex-1 bg-[#23213a] border border-gray-500 text-white px-3 py-2 rounded text-base"
                          style={{ minWidth: '200px' }}
                          value={
                            typeof choice === 'string' ? choice : choice.text
                          }
                          onChange={(e) => {
                            const updated = value.map((c, i) =>
                              i === idx
                                ? {
                                    text: e.target.value,
                                    isCorrect: c.isCorrect || false,
                                  }
                                : typeof c === 'string'
                                  ? { text: c, isCorrect: false }
                                  : c,
                            );
                            setFull({ ...full, answerChoices: updated });
                          }}
                          placeholder={`Choice ${idx + 1}`}
                        />
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={
                            typeof choice === 'object'
                              ? !!choice.isCorrect
                              : false
                          }
                          onChange={() => {
                            const updated = value.map((c, i) =>
                              i === idx
                                ? {
                                    text: typeof c === 'string' ? c : c.text,
                                    isCorrect: true,
                                  }
                                : {
                                    text: typeof c === 'string' ? c : c.text,
                                    isCorrect: false,
                                  },
                            );
                            setFull({ ...full, answerChoices: updated });
                          }}
                          title="Mark as correct"
                        />
                      </div>
                    ))}
                  </div>
                );
              }
              // Default: string/number fields
              return (
                <div
                  key={key}
                  className="flex flex-col border border-[#696969] rounded-lg bg-[#18162a] p-4"
                >
                  <label className="font-semibold mb-1 capitalize">{key}</label>
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-400"
                    value={value}
                    onChange={(e) => {
                      setFull({ ...full, [key]: e.target.value });
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full text-center text-gray-400">
            No question generated yet.
          </div>
        )}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4">
        <button
          className="main-button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
        <button
          className="secondary-button"
          onClick={handleApprove}
          disabled={loading || !full}
        >
          {loading ? 'Approving...' : approved ? 'Approved!' : 'Approve & Save'}
        </button>
        {error && <div className="text-red-500">{error}</div>}
      </div>
    </div>
  );
}
