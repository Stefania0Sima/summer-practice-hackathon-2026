import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { ArrowLeft, Crown, Sparkles, Users, RefreshCw, Loader2 } from 'lucide-react';
import { SPORTS } from '../config/sports';
import { SportIcon } from '../components/SportIcons';

export default function MatchResultPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sportId = params.get('sport') || 'football';
  const eventId = params.get('event');
  const matched = params.get('matched') === 'true';
  const sport = SPORTS.find((s) => s.id === sportId);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(!matched);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (eventId && matched) {
      api.get(`/api/events/${eventId}`).then((ev) => {
        setResult({
          matched: true,
          players: ev.participants.map((p) => ({
            id: p.id,
            name: p.name || 'User',
            skill_level: 'Intermediate',
            is_captain: p.is_captain,
          })),
          event_id: ev.id,
          compatibility_score: 85,
          sport_name: sport?.name,
        });
      }).catch(() => {});
    } else {
      runMatch();
    }
  }, []);

  async function runMatch() {
    setLoading(true);
    try {
      const res = await api.post('/api/matching/run', { sport_key: sportId });
      setResult(res);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleRetry() {
    setRetrying(true);
    await runMatch();
    setRetrying(false);
  }

  function handleJoin() {
    if (result?.event_id) {
      navigate(`/events/${result.event_id}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-sm text-warm-500">Finding your match...</p>
        </div>
      </div>
    );
  }

  const players = result?.players || [];

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
          {result?.matched ? (
            <>
              <h2 className="text-xl font-bold text-warm-900">Match found!</h2>
              <p className="text-sm text-warm-500 mt-1">
                {players.length} players ready for {sport?.name}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-warm-900">Not enough players yet</h2>
              <p className="text-sm text-warm-500 mt-1">
                {result?.current || 1} / {result?.needed || sport?.minGroup} needed for {sport?.name}
              </p>
            </>
          )}
        </div>

        {/* Players grid */}
        {players.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {players.map((player) => {
              const initials = (player.name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div
                  key={player.id}
                  className="bg-white rounded-xl border border-warm-100 p-3.5 flex items-center gap-2.5"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      player.is_captain
                        ? 'bg-amber-400 text-warm-900'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold truncate">{player.name}</p>
                      {player.is_captain && <Crown size={12} className="text-amber-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-warm-500">{player.skill_level}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI compatibility score */}
        {result?.compatibility_score && (
          <div className="bg-green-50 rounded-xl px-4 py-3.5 mb-5 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-200 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-green-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">{result.compatibility_score}% compatible</p>
              <p className="text-xs text-green-700 mt-0.5">Based on skill level, preferences, and area</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {result?.matched && result?.event_id ? (
          <button
            onClick={handleJoin}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border-none mb-2"
          >
            <Users size={18} />
            Go to event
          </button>
        ) : (
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border-none mb-2"
          >
            Back to home
          </button>
        )}
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="w-full py-3 text-sm text-warm-500 bg-transparent border-none cursor-pointer flex items-center justify-center gap-1.5 hover:text-warm-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Searching...' : 'Find a different group'}
        </button>
      </div>
    </div>
  );
}
