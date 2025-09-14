// scripts/seedDecks.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually (no dotenv dependency needed)
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
    
    console.log('✅ Environment variables loaded from .env.local');
  } catch (error) {
    console.error('❌ Could not load .env.local file');
    console.error('Make sure you have a .env.local file in your project root');
    process.exit(1);
  }
}

// Load environment variables
loadEnvFile();

// Define the schema directly in the seed script (no imports needed)
const CardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const FlashcardDeckSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  cards: [CardSchema],
}, { timestamps: true });

// Create the model directly
const FlashcardDeck = mongoose.models.FlashcardDeck || mongoose.model('FlashcardDeck', FlashcardDeckSchema);

const sampleDecks = [
  {
    name: "Basic Math",
    description: "Simple arithmetic questions",
    cards: [
      { question: "What is 2 + 2?", answer: "4" },
      { question: "What is 5 * 3?", answer: "15" },
      { question: "What is 10 - 7?", answer: "3" },
      { question: "What is 8 / 2?", answer: "4" },
      { question: "What is 12 + 8?", answer: "20" },
      { question: "What is 9 * 4?", answer: "36" },
      { question: "What is 15 - 6?", answer: "9" },
      { question: "What is 7 * 8?", answer: "56" },
    ]
  },
  {
    name: "World Capitals",
    description: "Capital cities around the world",
    cards: [
      { question: "What is the capital of France?", answer: "Paris" },
      { question: "What is the capital of Japan?", answer: "Tokyo" },
      { question: "What is the capital of Australia?", answer: "Canberra" },
      { question: "What is the capital of Brazil?", answer: "Brasília" },
      { question: "What is the capital of Canada?", answer: "Ottawa" },
      { question: "What is the capital of Italy?", answer: "Rome" },
      { question: "What is the capital of Germany?", answer: "Berlin" },
      { question: "What is the capital of Spain?", answer: "Madrid" },
    ]
  },
  {
    name: "Quick Animals",
    description: "Fast-paced animal questions",
    cards: [
      { question: "What animal says 'meow'?", answer: "cat" },
      { question: "What animal says 'woof'?", answer: "dog" },
      { question: "What animal says 'moo'?", answer: "cow" },
      { question: "King of the jungle?", answer: "lion" },
      { question: "Largest ocean mammal?", answer: "whale" },
      { question: "Tallest animal?", answer: "giraffe" },
      { question: "Fastest land animal?", answer: "cheetah" },
    ]
  },
  {
    name: "Programming Basics",
    description: "Basic programming concepts",
    cards: [
      { question: "What does HTML stand for?", answer: "HyperText Markup Language" },
      { question: "What does CSS stand for?", answer: "Cascading Style Sheets" },
      { question: "Most popular JavaScript framework?", answer: "React" },
      { question: "What does API stand for?", answer: "Application Programming Interface" },
      { question: "What does JSON stand for?", answer: "JavaScript Object Notation" },
      { question: "What does SQL stand for?", answer: "Structured Query Language" },
    ]
  }
];

async function seedDecks() {
  try {
    console.log('🚀 Starting to seed flashcard decks...');
    
    // Check if MongoDB URI exists
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.log('Make sure you have MONGODB_URI in your .env.local file');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing decks (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing decks...');
    const deleteResult = await FlashcardDeck.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing decks`);

    // Insert new decks
    console.log('📚 Inserting sample decks...');
    const insertedDecks = await FlashcardDeck.insertMany(sampleDecks);
    
    console.log(`✅ Successfully inserted ${insertedDecks.length} decks:`);
    insertedDecks.forEach((deck, index) => {
      console.log(`   ${index + 1}. ${deck.name} (${deck.cards.length} cards)`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('You can now run "npm run dev" and test the game.');
    
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding decks:', error.message);
    console.error('Full error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seeding function
seedDecks();