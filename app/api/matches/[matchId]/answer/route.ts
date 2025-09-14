import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/lib/models/Match';
import User from '@/lib/models/User';
import { supabase } from '@/lib/superbase';

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

    const { answer } = await request.json();
    
    await connectDB();
    
    const match = await Match.findById(matchId);
    
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const currentQuestion = match.questions[match.currentQuestionIndex];
    
    if (!currentQuestion || currentQuestion.answered) {
      return NextResponse.json({ 
        error: 'Question already answered or not found',
        alreadyAnswered: true 
      }, { status: 400 });
    }

    // FIXED: Better answer validation logic
    const userAnswer = String(answer).toLowerCase().trim();
    const correctAnswer = String(currentQuestion.answer).toLowerCase().trim();
    
    // Debug logging
    console.log('User answer:', userAnswer);
    console.log('Correct answer:', correctAnswer);
    console.log('Match:', userAnswer === correctAnswer);
    
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
      // Mark question as answered FIRST to prevent race conditions
      currentQuestion.answered = true;
      currentQuestion.answeredBy = session.user.id;
      
      // Update player score
      const currentScore = match.scores.get(session.user.id) || 0;
      match.scores.set(session.user.id, currentScore + 1);
      
      // Update user's total score
      await User.findByIdAndUpdate(session.user.id, { $inc: { totalScore: 1 } });
      
      // Move to next question
      match.currentQuestionIndex += 1;
      
      let winnerId: string | null = null;
      
      // Check if game is over
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

      // Broadcast score update immediately
      await supabase.channel(`realtime-match-${matchId}`)
        .send({
          type: 'broadcast',
          event: 'score-update',
          payload: {
            scores: Object.fromEntries(match.scores),
            answeredBy: session.user.id,
            questionIndex: match.currentQuestionIndex - 1,
            correctAnswer: currentQuestion.answer
          }
        });

      // Handle game completion or next question
      if (match.status === 'completed') {
        await supabase.channel(`realtime-match-${matchId}`)
          .send({
            type: 'broadcast',
            event: 'game-over',
            payload: {
              winner: winnerId,
              finalScores: Object.fromEntries(match.scores)
            }
          });
      } else {
        // Wait 2 seconds before showing next question
        setTimeout(async () => {
          const nextQuestion = match.questions[match.currentQuestionIndex];
          await supabase.channel(`realtime-match-${matchId}`)
            .send({
              type: 'broadcast',
              event: 'next-card',
              payload: {
                question: nextQuestion.question,
                questionIndex: match.currentQuestionIndex
              }
            });
        }, 2000);
      }

      return NextResponse.json({ 
        correct: true, 
        score: match.scores.get(session.user.id),
        correctAnswer: currentQuestion.answer
      });
    } else {
      return NextResponse.json({ 
        correct: false,
        message: `Incorrect. Expected: ${correctAnswer}, Got: ${userAnswer}`,
        debug: {
          userAnswer: userAnswer,
          correctAnswer: correctAnswer,
          originalUserAnswer: answer,
          originalCorrectAnswer: currentQuestion.answer
        }
      });
    }
  } catch (error) {
    console.error('Answer submission error:', error);
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}
