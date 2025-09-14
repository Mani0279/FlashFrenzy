import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '@/lib/models/Match';

interface Question {
  question: string;
  answer: string;
  answered: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const { matchId } = await params;
    await connectDB();

    const match = await Match.findById(matchId).populate('players', 'name');

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({
  match: {
    _id: match._id,
    players: match.players,
    currentQuestionIndex: match.currentQuestionIndex,
    currentQuestion: match.questions[match.currentQuestionIndex],
    allQuestions: match.questions.map((q: Question, index: number) => ({
      index,
      question: q.question,
      answer: q.answer,
      answerType: typeof q.answer,
      answered: q.answered,
    })),
    scores: Object.fromEntries(match.scores || new Map()),
    status: match.status,
  },
});
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
