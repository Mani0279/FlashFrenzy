import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  deckId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlashcardDeck', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scores: { type: Map, of: Number, default: {} },
  questions: [{
    question: String,
    answer: String,
    answered: { type: Boolean, default: false },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  currentQuestionIndex: { type: Number, default: 0 },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
  gameStarted: { type: Boolean, default: false }, // Add this field
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);