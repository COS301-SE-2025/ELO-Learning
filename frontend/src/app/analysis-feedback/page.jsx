'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavLinks from '../ui/nav-links';
import NavBar from '../ui/nav-bar';

export default function AnalysisFeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState(null);

  const submitFeedback = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // Placeholder: adapt endpoint when backend exists
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, timestamp: Date.now() }),
      });
      setStatus('sent');
      setFeedback('');
    } catch (err) {
      console.error('Feedback submit error:', err);
      setStatus('error');
    }
  };

  return (
    // add bottom padding so fixed footer/nav doesn't overlap content on small screens
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

          <h1 className="text-2xl font-bold mb-4">Match Analysis & Feedback</h1>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              Analysis (placeholder)
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Summary, charts and per-question stats will appear here. Replace
              this area with real charts/components when ready.
            </p>
            <div className="h-40 border border-dashed rounded p-4 flex items-center justify-center text-gray-400">
              Analysis widgets placeholder
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Share feedback</h2>
            <form onSubmit={submitFeedback} className="flex flex-col gap-3">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you noticed, what was confusing or suggestions..."
                className="w-full p-3 border rounded min-h-[120px]"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!feedback || status === 'sending'}
                  className="primary-button"
                >
                  {status === 'sending' ? 'Sending...' : 'Send feedback'}
                </button>
                <span className="text-sm text-gray-600">
                  {status === 'sent' && 'Thanks — feedback sent.'}
                  {status === 'error' && 'Error sending feedback.'}
                </span>
              </div>
            </form>
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
