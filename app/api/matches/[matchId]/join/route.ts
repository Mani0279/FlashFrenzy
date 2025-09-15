import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/lib/models/Match';
import { supabase } from '@/lib/superbase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params; // FIX: await params
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const match = await Match.findById(matchId);
    
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (!match.players.includes(session.user.id)) {
      match.players.push(session.user.id);
      match.scores.set(session.user.id, 0);
      await match.save();

      // Broadcast player joined event
      await supabase.channel(`realtime-match-${matchId}`)
        .send({
          type: 'broadcast',
          event: 'player-joined',
          payload: {
            playerId: session.user.id,
            playerName: session.user.name,
            players: match.players
          }
        });
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to join match' }, { status: 500 });
  }
}