import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/lib/models/Match';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const matches = await Match.find({ 
      players: session.user.id,
      status: 'completed'
    })
    .populate('players', 'name')
    .populate('deckId', 'name')
    .populate('winner', 'name')
    .sort({ createdAt: -1 });
    
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch match history' }, { status: 500 });
  }
}