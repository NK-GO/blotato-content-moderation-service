import { useState, FormEvent } from 'react';
import type { ModerationResult } from '@/types';

type ApiResult = ModerationResult & { error?: string };

export default function HomePage() {
  const [text, setText] = useState<string>('');
  const [authorId, setAuthorId] = useState<string>('user-123');
  const [result, setResult] = useState<ApiResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, authorId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API returns 400 for FLAG/REJECT, which is caught here
        setResult({
          finalDecision: data.error.includes('REJECT') ? 'REJECT' : 'FLAG',
          reasons: data.reasons || ['An error occurred.'],
          error: data.error,
        });
      } else {
        // API returns 200 for APPROVE
        setResult(data);
      }
    } catch (err) {
      setResult({
        finalDecision: 'FLAG',
        reasons: ['Failed to connect to the API.'],
        error: 'Network or server error.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getResultColor = (decision: string) => {
    switch (decision) {
      case 'APPROVE':
        return 'border-green-500 bg-green-500/10 text-green-300';
      case 'FLAG':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-300';
      case 'REJECT':
        return 'border-red-500 bg-red-500/10 text-red-300';
      default:
        return 'border-gray-600 bg-gray-500/10 text-gray-300';
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-2">Content Moderation</h1>
        <p className="text-center text-gray-400 mb-8">
          Test the moderation pipeline with AI analysis, PII detection, and a blocklist.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="authorId" className="block text-sm font-medium text-gray-300 mb-2">
              Author ID
            </label>
            <input
              id="authorId"
              type="text"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-2">
              Content to Moderate
            </label>
            <textarea
              id="text"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Enter text to analyze..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300"
          >
            {isLoading ? 'Analyzing...' : 'Moderate Content'}
          </button>
        </form>

        {result && (
          <div className={`mt-8 p-6 border rounded-lg ${getResultColor(result.finalDecision)}`}>
            <h2 className="text-2xl font-bold mb-3">Moderation Result</h2>
            <p className="text-lg">
              <span className="font-semibold">Final Decision:</span>{' '}
              <span className={`font-bold ${getResultColor(result.finalDecision).split(' ')[2]}`}>
                {result.finalDecision}
              </span>
            </p>
            {result.reasons && result.reasons.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Reasons:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  {result.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}