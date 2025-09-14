import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/lib/models/Match';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const match = await Match.findById(matchId);
    
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Check if user is the host (first player)
    if (match.players[0].toString() !== session.user.id) {
      return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
    }

    // Update match to started
    match.gameStarted = true;
    match.status = 'active';
    await match.save();

    return NextResponse.json({ success: true, gameStarted: true });
  } catch (error) {
    console.error('Failed to start game:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}