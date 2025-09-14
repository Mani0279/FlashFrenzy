import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '@/lib/models/Match';

export async function GET() {
  try {
    await connectDB();
    
    // Find active matches and populate both players and deckId
    const matches = await Match.find({ 
      status: { $in: ['waiting', 'active'] } 
    })
    .populate('players', 'name email')
    .populate('deckId', 'name description')
    .sort({ createdAt: -1 })
    .lean(); // Use lean() for better performance
    
    // Filter out matches with null/undefined deckId (in case deck was deleted)
    const validMatches = matches.filter(match => match.deckId && match.deckId.name);
    
    return NextResponse.json(validMatches);
  } catch (error) {
    console.error('Error fetching active matches:', error);
    return NextResponse.json({ error: 'Failed to fetch active matches' }, { status: 500 });
  }
}