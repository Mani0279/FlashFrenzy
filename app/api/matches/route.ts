import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/lib/models/Match';
import FlashcardDeck from '@/lib/models/FlashcardDeck';

interface Card {
  question: string;
  answer: string;
}

interface MatchQuestion {
  question: string;
  answer: string;
  answered: boolean;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deckId } = await request.json();
    
    await connectDB();
    
    const deck = await FlashcardDeck.findById(deckId);
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const match = await Match.create({
      deckId,
      players: [session.user.id],
      scores: { [session.user.id]: 0 },
      questions: deck.cards.map((card: Card): MatchQuestion => ({
        question: card.question,
        answer: card.answer,
        answered: false
      }))
    });

    return NextResponse.json({ matchId: match._id });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
  }
}