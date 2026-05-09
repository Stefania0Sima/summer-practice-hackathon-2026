import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../scripts/useAuth';
import { api } from '../config/api';
import { Plus, ChevronRight, Hand, X, Users, Clock, MapPin, ArrowLeft, Loader2, Undo2, ArrowRight, Camera, Sparkles } from 'lucide-react';
import { SPORTS, SKILL_LEVELS } from '../config/sports';
import { SportIcon } from '../components/SportIcons';
import { useToast } from '../components/Toast';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [showedUp, setShowedUp] = useState(false);
  const [pickingSport, setPickingSport] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [obStep, setObStep] = useState(0);
  const [obSports, setObSports] = useState([]);
  const [obSkills, setObSkills] = useState({});
  const [obBio, setObBio] = useState('');
  const [obCity, setObCity] = useState('');
  const [obSaving, setObSaving] = useState(false);
  const [obAvatar, setObAvatar] = useState(null);
  const [analyzingBio, setAnalyzingBio] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    async function load() {
      try {
        const [profile, events, avail, users] = await Promise.all([
          api.get('/api/users/me'),
          api.get('/api/events/mine'),
          api.get('/api/availability/today'),
          api.get('/api/availability/available-users'),
        ]);
        if (!profile.sports || profile.sports.length === 0) {
          setNeedsOnboarding(true);
          setObBio(profile.bio || '');
          setObCity(profile.city || '');
        }
        setMyEvents(events);
        setAvailableUsers(users.filter((u) => u.id !== user?.id));
        if (avail.available) setShowedUp(true);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handlePickSport(sportId) {
    setMatching(true);
    try {
      await api.post('/api/availability/today', { sport_key: sportId });
      const result = await api.post('/api/matching/run', { sport_key: sportId });
      setShowedUp(true);
      setPickingSport(false);
      navigate(`/match?sport=${sportId}&event=${result.event_id || ''}&matched=${result.matched}`);
    } catch {
      setShowedUp(true);
      setPickingSport(false);
    } finally {
      setMatching(false);
    }
  }

  function handleNotToday() {
    setShowedUp(true);
  }

  async function handleCancelAvailability() {
    try {
      await api.delete('/api/availability/today');
      setShowedUp(false);
      toast('Availability cancelled', 'info');
    } catch {
      toast('Failed to cancel', 'error');
    }
  }

  function handleShowUp() {
    setPickingSport(true);
  }

  function toggleObSport(id) {
    setObSports((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  async function handleObAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setObAvatar(URL.createObjectURL(file));
    const form = new FormData();
    form.append('file', file);
    try {
      await fetch('/api/users/me/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      });
      toast('Photo uploaded!');
    } catch {}
  }

  async function handleObAnalyzeBio() {
    if (!obBio.trim()) return;
    setAnalyzingBio(true);
    try {
      const result = await api.post('/api/ai/analyze-bio', { bio: obBio });
      setAiSuggestions(result);
      toast('Bio analyzed!');
      if (result.sports?.length > 0) {
        setObSports((prev) => [...new Set([...prev, ...result.sports])]);
      }
      if (result.skill_hints) {
        setObSkills((prev) => ({ ...prev, ...result.skill_hints }));
      }
    } catch {}
    finally { setAnalyzingBio(false); }
  }

  async function handleObFinish() {
    setObSaving(true);
    try {
      await api.put('/api/users/me', { bio: obBio, city: obCity });
      const sports = obSports.map((key) => ({
        sport_key: key,
        skill_level: obSkills[key] || 'Beginner',
      }));
      await api.put('/api/users/me/sports', { sports });
      setNeedsOnboarding(false);
      toast('Profile set up! Welcome to ShowUp2Move!');
    } catch {
      toast('Failed to save', 'error');
    } finally {
      setObSaving(false);
    }
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (needsOnboarding) {
    return (
      <div className="flex-1 px-5 pt-8 pb-6">
        <div className="max-w-sm mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex gap-1.5 mb-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                    i <= obStep ? 'bg-green-500' : 'bg-warm-100'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-warm-500">Step {obStep + 1} of 3 — Set up your profile</p>
          </div>

          {/* Step 0: Pick sports */}
          {obStep === 0 && (
            <>
              <h2 className="text-xl font-bold text-warm-900 mb-1">What do you play?</h2>
              <p className="text-sm text-warm-500 mb-5">Pick all sports you're interested in</p>
              <div className="grid grid-cols-3 gap-2.5">
                {SPORTS.map((sport) => {
                  const active = obSports.includes(sport.id);
                  return (
                    <button
                      key={sport.id}
                      onClick={() => toggleObSport(sport.id)}
                      className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-[1.5px] cursor-pointer transition-all ${
                        active
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-white border-warm-200 text-warm-700 hover:border-warm-500'
                      }`}
                    >
                      <SportIcon sportId={sport.id} size={28} strokeWidth={active ? 2.2 : 1.8} />
                      <span className={`text-xs ${active ? 'font-semibold' : ''}`}>{sport.name}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => obSports.length > 0 && setObStep(1)}
                disabled={obSports.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer mt-6"
              >
                Continue ({obSports.length} selected)
                <ArrowRight size={16} />
              </button>
            </>
          )}

          {/* Step 1: Skill levels */}
          {obStep === 1 && (
            <>
              <h2 className="text-xl font-bold text-warm-900 mb-1">Your skill level</h2>
              <p className="text-sm text-warm-500 mb-5">Helps us match you with similar players</p>
              <div className="flex flex-col gap-3">
                {obSports.map((sportId) => {
                  const sport = SPORTS.find((s) => s.id === sportId);
                  return (
                    <div key={sportId} className="bg-white rounded-2xl border border-warm-100 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <SportIcon sportId={sportId} size={22} className="text-green-700" />
                        <span className="font-semibold text-sm">{sport.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {SKILL_LEVELS.map((level) => {
                          const active = obSkills[sportId] === level;
                          return (
                            <button
                              key={level}
                              onClick={() => setObSkills((p) => ({ ...p, [sportId]: level }))}
                              className={`flex-1 py-2 text-xs rounded-lg border-[1.5px] cursor-pointer transition-all ${
                                active
                                  ? 'bg-green-50 border-green-500 text-green-800 font-semibold'
                                  : 'bg-white border-warm-200 text-warm-700 hover:border-warm-500'
                              }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setObStep(0)}
                  className="px-5 py-3 text-sm text-warm-700 bg-transparent border-none cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={() => setObStep(2)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* Step 2: Bio + photo + city */}
          {obStep === 2 && (
            <>
              <h2 className="text-xl font-bold text-warm-900 mb-1">Almost done!</h2>
              <p className="text-sm text-warm-500 mb-5">Tell people a bit about yourself</p>

              {/* Avatar upload */}
              <div className="flex flex-col items-center mb-4">
                <label className="w-20 h-20 rounded-full bg-green-100 border-2 border-dashed border-green-400 flex items-center justify-center cursor-pointer hover:bg-green-200 transition-colors overflow-hidden">
                  {obAvatar ? (
                    <img src={obAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={28} className="text-green-700" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleObAvatarUpload} />
                </label>
                <p className="text-xs text-warm-500 mt-2">Tap to upload photo (optional)</p>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <textarea
                  placeholder="Short bio — e.g. 'Weekend footballer, love playing 5-a-side after work'"
                  value={obBio}
                  onChange={(e) => setObBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition resize-y"
                />
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-500" />
                  <input
                    type="text"
                    placeholder="City / neighborhood"
                    value={obCity}
                    onChange={(e) => setObCity(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                  />
                </div>
              </div>

              {/* AI analyze bio */}
              <button
                onClick={handleObAnalyzeBio}
                disabled={!obBio.trim() || analyzingBio}
                className="w-full bg-green-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-2.5 cursor-pointer border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                {analyzingBio ? (
                  <Loader2 size={16} className="text-green-700 animate-spin shrink-0" />
                ) : (
                  <Sparkles size={16} className="text-green-700 shrink-0" />
                )}
                <p className="text-xs text-green-800 text-left leading-relaxed">
                  {analyzingBio ? 'Analyzing your bio...' : 'Let AI suggest sports from your bio'}
                </p>
              </button>

              {aiSuggestions?.sports?.length > 0 && (
                <div className="bg-green-50 rounded-xl px-4 py-3 mb-4 border border-green-200">
                  <p className="text-xs font-semibold text-green-800 mb-1">AI detected these sports:</p>
                  <p className="text-xs text-green-700">{aiSuggestions.sports.join(', ')}</p>
                  <p className="text-[10px] text-green-600 mt-1">Added to your selections on step 1</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setObStep(1)}
                  className="px-5 py-3 text-sm text-warm-700 bg-transparent border-none cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handleObFinish}
                  disabled={obSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {obSaving ? 'Saving...' : "Let's go!"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 pt-5 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-warm-500">{greeting}</p>
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
              {matching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={28} className="animate-spin text-white" />
                  <span className="ml-3 text-sm">Finding your match...</span>
                </div>
              ) : (
                <>
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
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-warm-100 p-5 text-center mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Hand size={20} className="text-green-700" />
          </div>
          <p className="font-semibold text-sm">You showed up today!</p>
          <p className="text-xs text-warm-500 mt-1">Check your events below</p>
          <button
            onClick={handleCancelAvailability}
            className="mt-3 text-xs text-warm-500 bg-transparent border-none cursor-pointer flex items-center gap-1 mx-auto hover:text-red-500 transition-colors"
          >
            <Undo2 size={12} />
            Cancel availability
          </button>
        </div>
      )}

      {/* Available users today */}
      {availableUsers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Users size={14} className="text-green-700" />
            Available today ({availableUsers.length})
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {availableUsers.map((u) => {
              const sport = SPORTS.find((s) => s.id === u.sport_key);
              const initials = (u.name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div key={u.id} className="flex flex-col items-center min-w-[60px] bg-white rounded-xl border border-warm-100 p-2.5">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-800 mb-1">
                    {initials}
                  </div>
                  <span className="text-[10px] font-medium text-warm-700 text-center truncate w-full">{(u.name || 'User').split(' ')[0]}</span>
                  {sport && (
                    <span className="text-[9px] text-warm-500 mt-0.5">{sport.name}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming events */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold">Your events</h3>
          <button
            onClick={() => navigate('/events')}
            className="text-xs text-green-700 font-medium bg-transparent border-none cursor-pointer flex items-center gap-0.5"
          >
            See all
            <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-warm-500 text-sm">Loading...</div>
        ) : myEvents.length === 0 ? (
          <div className="text-center py-8 text-warm-500 text-sm">
            No events yet. Show up or create one!
          </div>
        ) : (
          myEvents.slice(0, 4).map((ev) => (
            <button
              key={ev.id}
              onClick={() => navigate(`/events/${ev.id}`)}
              className="w-full bg-white rounded-2xl border border-warm-100 p-4 flex items-center gap-3.5 mb-2.5 cursor-pointer text-left hover:border-warm-200 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <SportIcon sportId={ev.sport_key} size={24} className="text-green-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-warm-900 truncate">{ev.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-warm-500">
                    <Clock size={12} />
                    {ev.date}{ev.time ? `, ${ev.time}` : ''}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-warm-500">
                    <Users size={12} />
                    {ev.player_count}/{ev.max_players}
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
          ))
        )}
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
