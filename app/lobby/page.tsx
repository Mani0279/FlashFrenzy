'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Deck {
  _id: string;
  name: string;
  description: string;
}

interface Match {
  _id: string;
  deckId: { 
    _id: string;
    name: string;
    description?: string;
  } | null;
  players: { 
    _id: string;
    name: string;
  }[];
  status: string;
  createdAt: string;
}

export default function Lobby() {
  const { data: session } = useSession();
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchDecks(), fetchActiveMatches()]);
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/decks');
      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error('Failed to fetch decks:', error);
      setError('Failed to load flashcard decks. Please refresh the page.');
    }
  };

  const fetchActiveMatches = async () => {
    try {
      const response = await fetch('/api/matches/active');
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      setActiveMatches(data);
    } catch (error) {
      console.error('Failed to fetch active matches:', error);
      setError('Failed to load active matches. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const createMatch = async (deckId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create match');
      }
      
      const data = await response.json();
      router.push(`/match/${data.matchId}`);
    } catch (error) {
      console.error('Failed to create match:', error);
      setError('Failed to create match. Please try again.');
      setLoading(false);
    }
  };

  const joinMatch = async (matchId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matches/${matchId}/join`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to join match');
      }
      
      router.push(`/match/${matchId}`);
    } catch (error) {
      console.error('Failed to join match:', error);
      setError('Failed to join match. Please try again.');
      setLoading(false);
    }
  };

  if (loading && decks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game lobby...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              Promise.all([fetchDecks(), fetchActiveMatches()]);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🎮 Game Lobby
          </h1>
          <p className="text-xl text-gray-700">
            Welcome back, <span className="font-semibold text-blue-600">{session?.user?.name}</span>! 
            Ready for a challenge?
          </p>
        </div>

        {/* Create New Match Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
              🚀 Create New Match
            </h2>
            
            {decks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <p className="text-gray-600 text-lg">No flashcard decks available.</p>
                <p className="text-gray-500">Please run the seed script to add sample decks.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {decks.map((deck) => (
                  <div key={deck._id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 p-6 transition-all duration-200 hover:-translate-y-1">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-3">🎯</div>
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{deck.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{deck.description}</p>
                    </div>
                    <button
                      onClick={() => createMatch(deck._id)}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? 'Creating...' : 'Create Match'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Matches Section */}
        <div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
              ⚡ Join Active Matches
            </h2>
            
            {activeMatches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎮</div>
                <p className="text-gray-600 text-lg mb-2">No active matches available right now.</p>
                <p className="text-gray-500">Create a new match above to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMatches.map((match) => {
                  // Safety check - skip matches with invalid deck data
                  if (!match.deckId || !match.deckId.name) {
                    return null;
                  }
                  
                  return (
                    <div key={match._id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 p-6 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-2xl">🎯</div>
                            <h3 className="font-bold text-xl text-gray-800">{match.deckId.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              match.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {match.status === 'waiting' ? '⏳ Waiting' : '🔥 Active'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-sm">👥 Players:</span>
                            <span className="font-medium">
                              {match.players?.length > 0 
                                ? match.players.map(p => p.name).join(', ') 
                                : 'No players yet'
                              }
                            </span>
                            <span className="text-sm text-gray-500">({match.players?.length || 0}/8)</span>
                          </div>
                          
                          <div className="text-sm text-gray-500 mt-1">
                            Created: {new Date(match.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => joinMatch(match._id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {loading ? 'Joining...' : '🚀 Join Match'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}