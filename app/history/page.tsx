'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface HistoryMatch {
  _id: string;
  deckId: { name: string };
  players: { _id: string; name: string }[];
  scores: Record<string, number>;
  winner: { _id: string; name: string } | null;
  createdAt: string;
  questions: { question: string; answer: string }[];
}

export default function History() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<HistoryMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<HistoryMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/user/history');
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserScore = (match: HistoryMatch, userId: string) => {
    return match.scores[userId] || 0;
  };

  const getUserRank = (match: HistoryMatch, userId: string) => {
    const scores = Object.values(match.scores).sort((a, b) => b - a);
    const userScore = match.scores[userId] || 0;
    return scores.indexOf(userScore) + 1;
  };

  if (loading) {
    return <div className="text-center py-8">Loading history...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Match History</h1>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No matches played yet.</p>
          <a
            href="/lobby"
            className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg"
          >
            Play Your First Match
          </a>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Match List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Matches</h2>
            {matches.map((match) => (
              <div
                key={match._id}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-colors ${
                  selectedMatch?._id === match._id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{match.deckId.name}</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    match.winner?._id === session?.user?.id 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {match.winner?._id === session?.user?.id ? '🏆 Won' : `#${getUserRank(match, session?.user?.id || '')}`}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Players: {match.players.map(p => p.name).join(', ')}</p>
                  <p>Your Score: {getUserScore(match, session?.user?.id || '')}</p>
                  <p>Date: {new Date(match.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Match Details */}
          <div>
            {selectedMatch ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Match Details</h2>
                
                {/* Final Scoreboard */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Final Scores</h3>
                  <div className="space-y-2">
                    {selectedMatch.players
                      .sort((a, b) => (selectedMatch.scores[b._id] || 0) - (selectedMatch.scores[a._id] || 0))
                      .map((player, index) => (
                        <div
                          key={player._id}
                          className={`flex justify-between items-center p-2 rounded ${
                            player._id === session?.user?.id ? 'bg-blue-100' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">#{index + 1}</span>
                            <span>{player.name}</span>
                            {index === 0 && <span>🏆</span>}
                            {player._id === session?.user?.id && (
                              <span className="text-sm text-blue-600">(You)</span>
                            )}
                          </div>
                          <span className="font-bold">{selectedMatch.scores[player._id] || 0}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Questions and Answers */}
                <div>
                  <h3 className="font-medium mb-3">Questions ({selectedMatch.questions.length})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedMatch.questions.map((q, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="font-medium mb-1">Q{index + 1}: {q.question}</div>
                        <div className="text-green-600">A: {q.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Select a match from the list to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}