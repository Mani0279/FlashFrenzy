import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/lib/models/Match';
import User from '@/lib/models/User';
import { supabase } from '@/lib/superbase';

export async function POST(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answer } = await request.json();

    await connectDB();

    const match = await Match.findById(params.matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const currentQuestion = match.questions[match.currentQuestionIndex];
    if (!currentQuestion || currentQuestion.answered) {
      return NextResponse.json({ error: 'Question already answered or not found' }, { status: 400 });
    }

    const isCorrect = answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    if (isCorrect) {
      currentQuestion.answered = true;
      currentQuestion.answeredBy = session.user.id;

      const currentScore = match.scores.get(session.user.id) || 0;
      match.scores.set(session.user.id, currentScore + 1);

      await User.findByIdAndUpdate(session.user.id, { $inc: { totalScore: 1 } });

      match.currentQuestionIndex += 1;

      // Declare winnerId here to be accessible below
      let winnerId: string | null = null;

      if (match.currentQuestionIndex >= match.questions.length) {
        match.status = 'completed';

        let maxScore = 0;
        for (const [playerId, score] of match.scores) {
          if (score > maxScore) {
            maxScore = score;
            winnerId = playerId;
          }
        }
        match.winner = winnerId;
      }

      await match.save();

      await supabase.channel(`realtime-match-${params.matchId}`).send({
        type: 'broadcast',
        event: 'score-update',
        payload: {
          scores: Object.fromEntries(match.scores),
          answeredBy: session.user.id,
          questionIndex: match.currentQuestionIndex - 1,
        },
      });

      if (match.status === 'completed') {
        await supabase.channel(`realtime-match-${params.matchId}`).send({
          type: 'broadcast',
          event: 'game-over',
          payload: {
            winner: winnerId,
            finalScores: Object.fromEntries(match.scores),
          },
        });
      } else {
        const nextQuestion = match.questions[match.currentQuestionIndex];
        await supabase.channel(`realtime-match-${params.matchId}`).send({
          type: 'broadcast',
          event: 'next-card',
          payload: {
            question: nextQuestion.question,
            questionIndex: match.currentQuestionIndex,
          },
        });
      }

      return NextResponse.json({ correct: true, score: match.scores.get(session.user.id) });
    } else {
      return NextResponse.json({ correct: false });
    }
  } catch (error) {
    console.error('Answer submission error:', error);
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}
