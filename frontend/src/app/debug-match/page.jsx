'use client';

import { getQuestionsByType } from '@/utils/api';
import { useEffect, useState } from 'react';

export default function DebugMatchPage() {
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function test() {
      try {
        console.log('🧪 DEBUG: Starting API test...');
        const result = await getQuestionsByType('Matching', 10);
        console.log('🧪 DEBUG: API Response:', result);
        setApiResult(result);
      } catch (error) {
        console.error('🧪 DEBUG: Error:', error);
        setApiResult({ success: false, error: error.message });
      } finally {
        setLoading(false);
      }
    }
    test();
  }, []);

  if (loading) {
    return <div className="p-8">Loading debug test...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Match Question Debug Page</h1>

      <div className="space-y-6">
        {/* API Response Section */}
        <section>
          <h2 className="text-lg font-semibold mb-2">API Response:</h2>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
            <pre className="text-sm">{JSON.stringify(apiResult, null, 2)}</pre>
          </div>
        </section>

        {/* Questions Section */}
        {apiResult?.success && apiResult?.data && (
          <section>
            <h2 className="text-lg font-semibold mb-2">
              Questions Found: {apiResult.data.length}
            </h2>

            {apiResult.data.map((question, index) => (
              <div
                key={question.Q_id}
                className="border border-gray-300 p-4 rounded-lg mb-4"
              >
                <h3 className="font-semibold">
                  Question {index + 1} (ID: {question.Q_id})
                </h3>
                <p>
                  <strong>Type:</strong> {question.type}
                </p>
                <p>
                  <strong>Text:</strong> {question.questionText}
                </p>
                <p>
                  <strong>Answers:</strong> {question.answers?.length || 0}{' '}
                  answers
                </p>

                {question.answers && question.answers.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Sample Answers:</p>
                    <ul className="list-disc pl-6">
                      {question.answers.slice(0, 3).map((answer, i) => (
                        <li key={i} className="text-sm">
                          {answer.answer_text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Error Section */}
        {!apiResult?.success && (
          <section>
            <h2 className="text-lg font-semibold mb-2 text-red-600">Error:</h2>
            <div className="bg-red-100 p-4 rounded-lg">
              <p>{apiResult?.error || 'Unknown error'}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
