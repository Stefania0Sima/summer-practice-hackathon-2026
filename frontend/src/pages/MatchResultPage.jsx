import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { ArrowLeft, Crown, Sparkles, Users, RefreshCw, Loader2, X } from 'lucide-react';
import { SPORTS } from '../config/sports';
import { SportIcon } from '../components/SportIcons';
import { useToast } from '../components/Toast';
import { useTheme } from '../scripts/useTheme';
import { useLanguage } from '../scripts/useLanguage';

export default function MatchResultPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sportId = params.get('sport') || 'football';
  const eventId = params.get('event');
  const matched = params.get('matched') === 'true';
  const sport = SPORTS.find((s) => s.id === sportId);

  const toast = useToast();
  const { dark } = useTheme();
  const { t } = useLanguage();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(!matched);
  const [retrying, setRetrying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [declining, setDeclining] = useState(false);

  const textMain = dark ? 'text-dark-text' : 'text-warm-900';
  const textMuted = dark ? 'text-dark-muted' : 'text-warm-500';
  const cardClass = dark ? 'bg-dark-card border-dark-border' : 'bg-white border-warm-100';

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
          compatibility_score: ev.compatibility_score,
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

  async function handleConfirm() {
    if (!result?.event_id) return;
    try {
      await api.post(`/api/events/${result.event_id}/join`);
      setConfirmed(true);
      toast('Match confirmed! +10 XP');
    } catch {
      toast('Failed to confirm match', 'error');
    }
  }

  async function handleDecline() {
    if (!result?.event_id) return;
    setDeclining(true);
    try {
      await api.post(`/api/events/${result.event_id}/decline`);
      toast('Match declined', 'info');
      navigate('/home');
    } catch {
      toast('Failed to decline', 'error');
      setDeclining(false);
    }
  }

  function handleJoin() {
    if (result?.event_id) {
      navigate(`/events/${result.event_id}`);
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-dark-bg' : 'bg-warm-white'}`}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-green-600 mx-auto mb-3" />
          <p className={`text-sm ${textMuted}`}>{t('findingMatch')}</p>
        </div>
      </div>
    );
  }

  const players = result?.players || [];

  return (
    <div className={`min-h-screen px-5 py-5 ${dark ? 'bg-dark-bg' : 'bg-warm-white'}`}>
      <div className="max-w-sm mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/home')}
          className={`flex items-center gap-1.5 text-sm bg-transparent border-none cursor-pointer mb-4 ${textMuted}`}
        >
          <ArrowLeft size={16} />
          {t('back')}
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 ${dark ? 'bg-green-900/40' : 'bg-green-100'}`}>
            <SportIcon sportId={sportId} size={32} className="text-green-700" />
          </div>
          {result?.matched ? (
            <>
              <h2 className={`text-xl font-bold ${textMain}`}>Match found!</h2>
              <p className={`text-sm mt-1 ${textMuted}`}>
                {players.length} {t('players').toLowerCase()} ready for {sport?.name}
              </p>
            </>
          ) : (
            <>
              <h2 className={`text-xl font-bold ${textMain}`}>Not enough players yet</h2>
              <p className={`text-sm mt-1 ${textMuted}`}>
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
                  className={`rounded-xl border p-3.5 flex items-center gap-2.5 ${cardClass}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      player.is_captain
                        ? 'bg-amber-400 text-warm-900'
                        : dark ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-semibold truncate ${textMain}`}>{player.name}</p>
                      {player.is_captain && <Crown size={12} className="text-amber-500 shrink-0" />}
                    </div>
                    <p className={`text-[11px] ${textMuted}`}>{player.skill_level}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI compatibility score */}
        {result?.compatibility_score && (
          <div className={`rounded-xl px-4 py-3.5 mb-5 flex items-center gap-3 ${dark ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-green-900/50' : 'bg-green-200'}`}>
              <Sparkles size={18} className="text-green-700" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${dark ? 'text-green-400' : 'text-green-800'}`}>{result.compatibility_score}% {t('compatible')}</p>
              <p className={`text-xs mt-0.5 ${dark ? 'text-green-500' : 'text-green-700'}`}>Based on skill level, preferences, and area</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {result?.matched && result?.event_id && !confirmed ? (
          <div className="flex flex-col gap-2 mb-2">
            <button
              onClick={handleConfirm}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
            >
              <Users size={18} />
              Accept match
            </button>
            <button
              onClick={handleDecline}
              disabled={declining}
              className="w-full py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-red-100 transition-colors"
            >
              <X size={16} />
              {declining ? 'Declining...' : 'Decline'}
            </button>
          </div>
        ) : result?.matched && confirmed ? (
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
            {t('back')} {t('home').toLowerCase()}
          </button>
        )}
        <button
          onClick={handleRetry}
          disabled={retrying}
          className={`w-full py-3 text-sm bg-transparent border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 ${textMuted}`}
        >
          <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Searching...' : 'Find a different group'}
        </button>
      </div>
    </div>
  );
}
