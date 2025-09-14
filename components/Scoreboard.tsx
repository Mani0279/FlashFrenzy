'use client';

interface Player {
  _id: string;
  name: string;
}

interface ScoreboardProps {
  players: Player[];
  scores: Record<string, number>;
  currentUserId: string;
}

export default function Scoreboard({ players, scores, currentUserId }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => (scores[b._id] || 0) - (scores[a._id] || 0));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        🏆 Scoreboard
      </h3>
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player._id}
            className={`flex justify-between items-center p-4 rounded-lg border-2 transition-all ${
              player._id === currentUserId 
                ? 'bg-blue-50 border-blue-200 shadow-md' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`font-bold text-lg ${
                index === 0 ? 'text-yellow-600' : 
                index === 1 ? 'text-gray-500' : 
                index === 2 ? 'text-amber-600' : 'text-gray-400'
              }`}>
                #{index + 1}
              </span>
              <span className="font-semibold text-gray-900">{player.name}</span>
              {player._id === currentUserId && (
                <span className="text-sm text-blue-600 font-medium">(You)</span>
              )}
              {index === 0 && <span className="text-xl">👑</span>}
            </div>
            <span className="font-bold text-2xl text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">
              {scores[player._id] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}