import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Sparkles, Users, RefreshCw } from 'lucide-react';
import { SPORTS } from '../config/sports';
import { SportIcon } from '../components/SportIcons';

// Mock data — will be replaced by POST /api/matching/run
const MOCK_PLAYERS = [
  { name: 'Alex M.', initials: 'AM', skill: 'Intermediate', isCaptain: false },
  { name: 'Dana R.', initials: 'DR', skill: 'Advanced', isCaptain: false },
  { name: 'Mihai P.', initials: 'MP', skill: 'Beginner', isCaptain: true },
  { name: 'Elena S.', initials: 'ES', skill: 'Intermediate', isCaptain: false },
  { name: 'Radu C.', initials: 'RC', skill: 'Advanced', isCaptain: false },
  { name: 'Ioana B.', initials: 'IB', skill: 'Intermediate', isCaptain: false },
  { name: 'Vlad T.', initials: 'VT', skill: 'Beginner', isCaptain: false },
  { name: 'Sofia L.', initials: 'SL', skill: 'Intermediate', isCaptain: false },
];

export default function MatchResultPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sportId = params.get('sport') || 'football';
  const sport = SPORTS.find((s) => s.id === sportId);

  function handleJoin() {
    navigate('/events/1'); // Will navigate to the auto-created event
  }

  return (
    <div className="min-h-screen bg-warm-white px-5 py-5">
      <div className="max-w-sm mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 text-sm text-warm-500 bg-transparent border-none cursor-pointer mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <SportIcon sportId={sportId} size={32} className="text-green-700" />
          </div>
          <h2 className="text-xl font-bold text-warm-900">Match found!</h2>
          <p className="text-sm text-warm-500 mt-1">
            {MOCK_PLAYERS.length} players ready for {sport?.name} near you
          </p>
        </div>

        {/* Players grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {MOCK_PLAYERS.map((player, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-warm-100 p-3.5 flex items-center gap-2.5"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  player.isCaptain
                    ? 'bg-amber-400 text-warm-900'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {player.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold truncate">{player.name}</p>
                  {player.isCaptain && <Crown size={12} className="text-amber-500 shrink-0" />}
                </div>
                <p className="text-[11px] text-warm-500">{player.skill}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI compatibility score */}
        <div className="bg-green-50 rounded-xl px-4 py-3.5 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-200 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-green-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">87% compatible</p>
            <p className="text-xs text-green-700 mt-0.5">Based on skill level, preferences, and area</p>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleJoin}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border-none mb-2"
        >
          <Users size={18} />
          Join this group
        </button>
        <button className="w-full py-3 text-sm text-warm-500 bg-transparent border-none cursor-pointer flex items-center justify-center gap-1.5 hover:text-warm-700">
          <RefreshCw size={14} />
          Find a different group
        </button>
      </div>
    </div>
  );
}
