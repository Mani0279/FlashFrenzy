'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/superbase';
import Flashcard from '@/components/Flashcard';
import AnswerInput from '@/components/AnswerInput';
import Scoreboard from '@/components/Scoreboard';
import PlayersList from '@/components/PlayersList';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Player {
  _id: string;
  name: string;
}

interface Question {
  question: string;
  answer: string;
  answered?: boolean;
}

interface Match {
  _id: string;
  players: Player[];
  scores: Record<string, number>;
  questions: Question[];
  currentQuestionIndex: number;
  status: 'waiting' | 'active' | 'completed';
  gameStarted?: boolean;
  winner?: Player;
}

export default function GameRoom() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [match, setMatch] = useState<Match | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showingResults, setShowingResults] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string>('');
  const [whoAnswered, setWhoAnswered] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);

  const fetchMatch = useCallback(async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}`);
      if (response.ok) {
        const matchData = await response.json();
        setMatch(matchData);
        setGameStatus(matchData.status);
        setGameStarted(matchData.gameStarted || false);
        
        // If game is active and we have questions, set current question
        if (matchData.gameStarted && matchData.questions && matchData.questions.length > 0) {
          const currentQ = matchData.questions[matchData.currentQuestionIndex];
          if (currentQ) {
            setCurrentQuestion(currentQ.question);
            setQuestionIndex(matchData.currentQuestionIndex);
            setGameStatus('active');
          }
        }
      }
    } catch (_error) {
      console.error('Failed to fetch match:', _error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // Initialize match data
  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!matchId || !session?.user?.id) return;

    // Remove existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(`realtime-match-${matchId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: session.user.id }
      }
    });

    channel
      .on('broadcast', { event: 'player-joined' }, (payload) => {
        console.log('Player joined:', payload);
        fetchMatch(); // Refresh match data when player joins
      })
      .on('broadcast', { event: 'game-start' }, (payload) => {
        console.log('Game started:', payload);
        setGameStarted(true);
        setGameStatus('active');
        setCurrentQuestion(payload.payload.question);
        setQuestionIndex(payload.payload.questionIndex);
        setFeedback(null);
        setShowingResults(false);
      })
      .on('broadcast', { event: 'next-card' }, (payload) => {
        console.log('Next card:', payload);
        setCurrentQuestion(payload.payload.question);
        setQuestionIndex(payload.payload.questionIndex);
        setSubmitting(false);
        setFeedback(null);
        setShowingResults(false);
      })
      .on('broadcast', { event: 'score-update' }, (payload) => {
        console.log('Score update:', payload);
        setMatch(prev => prev ? { ...prev, scores: payload.payload.scores } : null);
        
        // Show who answered correctly
        const answerer = match?.players.find(p => p._id === payload.payload.answeredBy);
        setWhoAnswered(answerer?.name || 'Someone');
        setLastCorrectAnswer(payload.payload.correctAnswer);
        setShowingResults(true);
        
        if (payload.payload.answeredBy === session?.user?.id) {
          setFeedback({ type: 'success', message: 'Correct! You scored a point! 🎉' });
        } else {
          setFeedback({ 
            type: 'error', 
            message: `${answerer?.name} got it first! ⚡` 
          });
        }
        
        setTimeout(() => {
          setFeedback(null);
          setShowingResults(false);
        }, 3000);
      })
      .on('broadcast', { event: 'game-over' }, (payload) => {
        console.log('Game over:', payload);
        setGameStatus('completed');
        setMatch(prev => prev ? { 
          ...prev, 
          status: 'completed', 
          scores: payload.payload.finalScores,
          winner: match?.players.find(p => p._id === payload.payload.winner)
        } : null);
      })
      .subscribe((status) => {
        console.log('Channel subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [matchId, session?.user?.id, match?.players, fetchMatch]);

  const submitAnswer = async (answer: string) => {
    if (submitting || showingResults || !gameStarted) return;
    
    setSubmitting(true);

    try {
      const response = await fetch(`/api/matches/${matchId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      const result = await response.json();

      if (result.alreadyAnswered) {
        setFeedback({ 
          type: 'error', 
          message: 'Too slow! Someone else got it first! ⚡' 
        });
        setSubmitting(false);
        return;
      }

      // For incorrect answers, show immediate feedback
      if (!result.correct) {
        setFeedback({ type: 'error', message: result.message || 'Incorrect answer. Keep trying!' });
        setSubmitting(false);
      }
      // Correct answers will be handled by real-time events
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to submit answer' });
      setSubmitting(false);
    }
  };

  const startGame = async () => {
    if (!match?.questions || match.questions.length === 0) return;
    
    try {
      // Update match status in database first
      const response = await fetch(`/api/matches/${matchId}/start`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to start game');
      }
      
      // Broadcast game start to all players
      await supabase.channel(`realtime-match-${matchId}`)
        .send({
          type: 'broadcast',
          event: 'game-start',
          payload: {
            question: match.questions[0].question,
            questionIndex: 0
          }
        });
        
      console.log('Game start broadcasted');
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading battle arena...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Match not found</h2>
          <button
            onClick={() => router.push('/lobby')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const isFirstPlayer = match.players[0]?._id === session?.user?.id;
  const currentUser = session?.user?.id || '';
  const canStartGame = isFirstPlayer && match.players.length >= 2 && !gameStarted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Real-Time Battle Arena
          </h1>
          <div className="flex justify-center items-center space-x-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              !gameStarted ? 'bg-yellow-100 text-yellow-800' :
              gameStatus === 'active' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {!gameStarted ? '⏳ Waiting for battle' :
               gameStatus === 'active' ? '🔥 Live Battle!' :
               '🏆 Battle Complete'}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Waiting State */}
            {!gameStarted && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🎮 Preparing for Battle
                </h2>
                <p className="text-gray-600 mb-6">
                  {match.players.length < 2 
                    ? "Waiting for more players to join. First to answer correctly wins each round!"
                    : "All players ready! Waiting for host to start the battle."
                  }
                </p>
                
                {canStartGame ? (
                  <button
                    onClick={startGame}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-8 rounded-xl font-bold text-xl shadow-lg transform hover:scale-105 transition-all"
                  >
                    🚀 START BATTLE NOW!
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-lg">
                      {match.players.length < 2 
                        ? `Need ${2 - match.players.length} more player(s)` 
                        : "Host will start the battle soon..."
                      }
                    </p>
                    {match.players.length < 2 && (
                      <div className="text-sm text-gray-400">
                        Share the match URL with friends to join!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Active Game */}
            {gameStarted && gameStatus === 'active' && currentQuestion && (
              <div className="space-y-6">
                
                {/* Results Display */}
                {showingResults && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-xl p-6 text-center animate-pulse">
                    <h3 className="text-2xl font-bold mb-2">⚡ {whoAnswered} scored!</h3>
                    <p className="text-lg">Correct answer: <span className="font-bold">{lastCorrectAnswer}</span></p>
                    <p className="text-sm opacity-90 mt-2">Next question coming in 2 seconds...</p>
                  </div>
                )}

                {/* Question Card */}
                <div className="transform transition-all duration-500">
                  <Flashcard
                    question={currentQuestion}
                    questionNumber={questionIndex + 1}
                    totalQuestions={match.questions.length}
                  />
                </div>
                
                {/* Answer Input */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <div className="mb-4 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      ⚡ Quick! Be the first to answer correctly!
                    </h3>
                    <div className="text-gray-600">
                      Type your answer and hit enter as fast as possible
                    </div>
                  </div>
                  
                  <AnswerInput
                    onSubmit={submitAnswer}
                    disabled={submitting || showingResults}
                  />
                  
                  {feedback && (
                    <div className={`mt-4 p-4 rounded-lg text-center font-medium transition-all ${
                      feedback.type === 'success' 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {feedback.message}
                    </div>
                  )}
                  
                  {submitting && !showingResults && (
                    <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-lg text-center">
                      <div className="animate-bounce">⚡ Submitting your answer...</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Game Over */}
            {gameStatus === 'completed' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">🎉 Battle Complete!</h2>
                {match.winner && (
                  <div className="mb-6">
                    <p className="text-2xl font-bold text-purple-600 mb-2">
                      👑 Champion: {match.winner.name}
                    </p>
                    <p className="text-gray-600">
                      Fastest fingers win in the flashcard arena!
                    </p>
                  </div>
                )}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.push('/lobby')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
                  >
                    🎮 New Battle
                  </button>
                  <button
                    onClick={() => router.push('/history')}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
                  >
                    📊 View History
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PlayersList players={match.players} currentUserId={currentUser} />
            <Scoreboard players={match.players} scores={match.scores} currentUserId={currentUser} />
            
            {/* Live Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                📡 Live Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Game Mode:</span>
                  <span className="font-semibold text-purple-600">Speed Battle</span>
                </div>
                <div className="flex justify-between">
                  <span>Players:</span>
                  <span className="font-semibold">{match.players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="font-semibold">{match.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Battle Started:</span>
                  <span className={`font-semibold ${gameStarted ? 'text-green-600' : 'text-yellow-600'}`}>
                    {gameStarted ? 'Yes ✓' : 'No ⏳'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}