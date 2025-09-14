interface FlashcardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
}

export default function Flashcard({ question, questionNumber, totalQuestions }: FlashcardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-6">
      <div className="text-sm font-medium text-blue-600 mb-4 text-center">
        Question {questionNumber} of {totalQuestions}
      </div>
      <div className="text-2xl font-semibold text-gray-900 text-center p-6 min-h-[120px] flex items-center justify-center">
        {question}
      </div>
    </div>
  );
}