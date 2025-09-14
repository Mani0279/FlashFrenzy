'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/superbase';
import Flashcard from '@/components/Flashcard';
import AnswerInput from '@/components/AnswerInput';
import Scoreboard from '@/components/Scoreboard';
import PlayersList from '@/components/PlayersList';

interface Match {
  _id: string;
  players: { _id: string; name: string }[];
  scores: Record<string, number>;
  questions: { question: string; answer: string }[];
  currentQuestionIndex: number;
  status: 'waiting' | 'active' | 'completed';
  winner?: { _id: string; name: string };
}

export default function GameRoom() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMatch = useCallback(async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}`);
      if (response.ok) {
        const matchData = await response.json();
        setMatch(matchData);
        setGameStatus(matchData.status);
        
        if (matchData.questions && matchData.questions.length > 0) {
          const currentQ = matchData.questions[matchData.currentQuestionIndex];
          if (currentQ) {
            setCurrentQuestion(currentQ.question);
            setQuestionIndex(matchData.currentQuestionIndex);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch match:', error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  useEffect(() => {
    if (!matchId) return;

    const channel = supabase.channel(`realtime-match-${matchId}`);

    channel
      .on('broadcast', { event: 'player-joined' }, (payload) => {
        fetchMatch(); // Refresh match data
      })
      .on('broadcast', { event: 'next-card' }, (payload) => {
        setCurrentQuestion(payload.payload.question);
        setQuestionIndex(payload.payload.questionIndex);
        setSubmitting(false);
        setFeedback(null);
      })
      .on('broadcast', { event: 'score-update' }, (payload) => {
        setMatch(prev => prev ? { ...prev, scores: payload.payload.scores } : null);
        setFeedback({ type: 'success', message: 'Score updated!' });
        setTimeout(() => setFeedback(null), 2000);
      })
      .on('broadcast', { event: 'game-over' }, (payload) => {
        setGameStatus('completed');
        setMatch(prev => prev ? { 
          ...prev, 
          status: 'completed', 
          scores: payload.payload.finalScores,
          winner: match?.players.find(p => p._id === payload.payload.winner)
        } : null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, match?.players, fetchMatch]);

  const submitAnswer = async (answer: string) => {
    if (submitting) return;
    
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/matches/${matchId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      const result = await response.json();

      if (result.correct) {
        setFeedback({ type: 'success', message: 'Correct! Well done!' });
      } else {
        setFeedback({ type: 'error', message: 'Incorrect. Try again on the next question!' });
        setSubmitting(false);
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to submit answer' });
      setSubmitting(false);
    }
  };

  const startGame = async () => {
    if (match?.questions && match.questions.length > 0) {
      setGameStatus('active');
      setCurrentQuestion(match.questions[0].question);
      setQuestionIndex(0);
      
      // Broadcast first question
      await supabase.channel(`realtime-match-${matchId}`)
        .send({
          type: 'broadcast',
          event: 'next-card',
          payload: {
            question: match.questions[0].question,
            questionIndex: 0
          }
        });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading match...</div>;
  }

  if (!match) {
    return <div className="text-center py-8">Match not found</div>;
  }

  const isFirstPlayer = match.players[0]?._id === session?.user?.id;
  const currentUser = session?.user?.id || '';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Match Room</h1>
        <div className="flex justify-center space-x-4 text-sm">
          <span className={`px-3 py-1 rounded-full ${
            gameStatus === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
            gameStatus === 'active' ? 'bg-green-100 text-green-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {gameStatus === 'waiting' ? 'Waiting for players' :
             gameStatus === 'active' ? 'Game in progress' :
             'Game completed'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-4">
          {gameStatus === 'waiting' && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Waiting for game to start...</h2>
              {isFirstPlayer && (
                <button
                  onClick={startGame}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg font-medium"
                >
                  Start Game
                </button>
              )}
              {!isFirstPlayer && (
                <p className="text-gray-600">Waiting for the host to start the game</p>
              )}
            </div>
          )}

          {gameStatus === 'active' && currentQuestion && (
            <>
              <Flashcard
                question={currentQuestion}
                questionNumber={questionIndex + 1}
                totalQuestions={match.questions.length}
              />
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <AnswerInput
                  onSubmit={submitAnswer}
                  disabled={submitting}
                />
                
                {feedback && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {feedback.message}
                  </div>
                )}
              </div>
            </>
          )}

          {gameStatus === 'completed' && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              {match.winner && (
                <p className="text-xl mb-4">
                  🎉 Winner: <span className="font-semibold">{match.winner.name}</span>
                </p>
              )}
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/lobby')}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg"
                >
                  Back to Lobby
                </button>
                <button
                  onClick={() => router.push('/history')}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg"
                >
                  View History
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <PlayersList players={match.players} currentUserId={currentUser} />
          <Scoreboard players={match.players} scores={match.scores} currentUserId={currentUser} />
        </div>
      </div>
    </div>
  );
}