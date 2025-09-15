import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FlashcardDeck from '@/lib/models/FlashcardDeck';

export async function GET() {
  try {
    await connectDB();
    
    const decks = await FlashcardDeck.find({}).select('name description');
    
    return NextResponse.json(decks);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, cards } = await request.json();
    
    await connectDB();
    
    const deck = await FlashcardDeck.create({
      name,
      description,
      cards
    });
    
    return NextResponse.json(deck, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }
}