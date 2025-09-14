export const validateAnswer = (userAnswer: string, correctAnswer: string): boolean => {
  return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
};

export const calculateWinner = (scores: Record<string, number>): string | null => {
  let maxScore = 0;
  let winner = null;
  
  for (const [playerId, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winner = playerId;
    }
  }
  
  return winner;
};

export const formatGameTime = (startTime: Date, endTime: Date): string => {
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};