'use client';

import { useState } from 'react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export default function AnswerInput({ onSubmit, disabled = false }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter your answer..."
        disabled={disabled}
        className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || !answer.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors shadow-lg"
      >
        {disabled ? 'Submitting...' : 'Submit Answer'}
      </button>
    </form>
  );
}