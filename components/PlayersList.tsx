'use client';

interface Player {
  _id: string;
  name: string;
}

interface PlayersListProps {
  players: Player[];
  currentUserId: string;
}

export default function PlayersList({ players, currentUserId }: PlayersListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        👥 Players ({players.length})
      </h3>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player._id}
            className={`flex items-center p-3 rounded-lg border-2 transition-all ${
              player._id === currentUserId 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="font-semibold text-gray-900">{player.name}</span>
            {player._id === currentUserId && (
              <span className="ml-3 text-sm text-blue-600 font-medium">(You)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}