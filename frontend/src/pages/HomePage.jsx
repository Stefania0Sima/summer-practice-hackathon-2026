import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../scripts/useAuth';
import { Plus, ChevronRight, Hand, X, Users, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { SPORTS } from '../config/sports';
import { SportIcon } from '../components/SportIcons';

// Mock data — will be replaced by API calls
const MOCK_EVENTS = [
  { id: '1', sportId: 'football', title: 'Football @ Arena Sport', date: 'Today, 18:00', players: '8/10', status: 'confirmed' },
  { id: '2', sportId: 'tennis', title: 'Tennis doubles', date: 'Tomorrow, 10:00', players: '3/4', status: 'waiting' },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showedUp, setShowedUp] = useState(false);
  const [pickingSport, setPickingSport] = useState(false);
  const firstName = user?.name?.split(' ')[0] || 'there';

  function handleShowUp() {
    setPickingSport(true);
  }

  function handlePickSport(sportId) {
    setShowedUp(true);
    setPickingSport(false);
    // Navigate to matching with selected sport
    navigate(`/match?sport=${sportId}`);
  }

  function handleNotToday() {
    setShowedUp(true);
  }

  return (
    <div className="flex-1 px-5 pt-5 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-warm-500">Good afternoon</p>
          <h1 className="text-xl font-bold text-warm-900">{firstName}</h1>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-sm font-semibold text-green-800 cursor-pointer border-none"
        >
          {(user?.name || 'U').slice(0, 2).toUpperCase()}
        </button>
      </div>

      {/* ShowUpToday card */}
      {!showedUp ? (
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white mb-6">
          {!pickingSport ? (
            <>
              <h2 className="text-lg font-bold mb-1">ShowUpToday?</h2>
              <p className="text-sm opacity-85 mb-5">Ready to play? We'll find you a group.</p>
              <div className="flex gap-2.5">
                <button
                  onClick={handleShowUp}
                  className="flex-1 bg-white text-green-800 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer border-none hover:bg-green-50 transition-colors"
                >
                  <Hand size={18} />
                  Yes, I'm in!
                </button>
                <button
                  onClick={handleNotToday}
                  className="px-5 py-3.5 rounded-xl text-sm bg-white/15 border-[1.5px] border-white/30 text-white cursor-pointer flex items-center gap-2 hover:bg-white/25 transition-colors"
                >
                  <X size={16} />
                  Not today
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-1">What do you want to play?</h2>
              <p className="text-sm opacity-85 mb-4">Pick a sport and we'll match you</p>
              <div className="grid grid-cols-3 gap-2">
                {SPORTS.slice(0, 6).map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => handlePickSport(sport.id)}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-white/15 border border-white/20 text-white cursor-pointer hover:bg-white/25 transition-colors"
                  >
                    <SportIcon sportId={sport.id} size={22} />
                    <span className="text-xs">{sport.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPickingSport(false)}
                className="mt-3 text-xs text-white/70 bg-transparent border-none cursor-pointer flex items-center gap-1 mx-auto"
              >
                <ArrowLeft size={14} />
                Cancel
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-warm-100 p-5 text-center mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Hand size={20} className="text-green-700" />
          </div>
          <p className="font-semibold text-sm">You showed up today!</p>
          <p className="text-xs text-warm-500 mt-1">We're finding your match...</p>
        </div>
      )}

      {/* Upcoming events */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold">Your events</h3>
          <button className="text-xs text-green-700 font-medium bg-transparent border-none cursor-pointer flex items-center gap-0.5">
            See all
            <ChevronRight size={14} />
          </button>
        </div>

        {MOCK_EVENTS.map((ev) => (
          <button
            key={ev.id}
            onClick={() => navigate(`/events/${ev.id}`)}
            className="w-full bg-white rounded-2xl border border-warm-100 p-4 flex items-center gap-3.5 mb-2.5 cursor-pointer text-left hover:border-warm-200 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <SportIcon sportId={ev.sportId} size={24} className="text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-warm-900 truncate">{ev.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-warm-500">
                  <Clock size={12} />
                  {ev.date}
                </span>
                <span className="flex items-center gap-1 text-xs text-warm-500">
                  <Users size={12} />
                  {ev.players}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                ev.status === 'confirmed'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {ev.status === 'confirmed' ? 'Confirmed' : 'Waiting'}
            </span>
          </button>
        ))}
      </div>

      {/* Create event */}
      <button
        onClick={() => navigate('/events/create')}
        className="w-full py-3.5 rounded-xl border-[1.5px] border-dashed border-green-400 bg-green-50 text-green-700 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-green-100 transition-colors"
      >
        <Plus size={18} />
        Create an event
      </button>
    </div>
  );
}

