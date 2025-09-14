import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const FlashcardDeckSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  cards: [CardSchema],
}, { timestamps: true });

export default mongoose.models.FlashcardDeck || mongoose.model('FlashcardDeck', FlashcardDeckSchema);