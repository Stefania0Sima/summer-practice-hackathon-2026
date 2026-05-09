import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText, Globe, Lock, Plus, Star } from 'lucide-react';
import { SPORTS } from '../config/sports';
import { SportIcon } from '../components/SportIcons';
import VenueMap from '../components/VenueMap';
import { useToast } from '../components/Toast';
import { useTheme } from '../scripts/useTheme';
import { useLanguage } from '../scripts/useLanguage';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { dark } = useTheme();
  const { t } = useLanguage();
  const [selectedSport, setSelectedSport] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [venues, setVenues] = useState([]);

  const textMain = dark ? 'text-dark-text' : 'text-warm-900';
  const textMuted = dark ? 'text-dark-muted' : 'text-warm-500';
  const textSub = dark ? 'text-dark-text' : 'text-warm-700';
  const inputClass = dark
    ? 'bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted'
    : 'bg-white border-warm-200';

  useEffect(() => {
    if (selectedSport) {
      api.get(`/api/venues?sport_key=${selectedSport}`).then(setVenues).catch(() => {});
    }
  }, [selectedSport]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!selectedSport || !title.trim() || !date) {
      setError(t('fillRequired'));
      return;
    }
    setCreating(true);
    setError('');
    try {
      const result = await api.post('/api/events', {
        title,
        sport_key: selectedSport,
        date,
        time: time || null,
        location: location || null,
        description: description || null,
        max_players: parseInt(maxPlayers) || 10,
        is_public: isPublic,
      });
      toast(t('eventCreated'));
      navigate(`/events/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={`min-h-screen px-5 py-5 ${dark ? 'bg-dark-bg' : 'bg-warm-white'}`}>
      <div className="max-w-sm mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-1.5 text-sm bg-transparent border-none cursor-pointer mb-4 ${textMuted}`}
        >
          <ArrowLeft size={16} />
          {t('back')}
        </button>

        <h2 className={`text-xl font-bold mb-1 ${textMain}`}>{t('createEvent')}</h2>
        <p className={`text-sm mb-6 ${textMuted}`}>{t('setupGame')}</p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          {/* Sport picker */}
          <div>
            <label className={`text-xs font-semibold mb-2 block ${textSub}`}>{t('sport')}</label>
            <div className="flex gap-2 flex-wrap">
              {SPORTS.map((sport) => {
                const active = selectedSport === sport.id;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setSelectedSport(sport.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-[1.5px] text-xs cursor-pointer transition-all ${
                      active
                        ? 'bg-green-50 border-green-500 text-green-800 font-semibold'
                        : dark
                          ? 'bg-dark-card border-dark-border text-dark-text hover:border-dark-muted'
                          : 'bg-white border-warm-200 text-warm-700 hover:border-warm-500'
                    }`}
                  >
                    <SportIcon sportId={sport.id} size={14} strokeWidth={active ? 2.5 : 2} />
                    {sport.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={`text-xs font-semibold mb-2 block ${textSub}`}>{t('title')}</label>
            <div className="relative">
              <FileText size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                placeholder="e.g. Friday evening football"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
              />
            </div>
          </div>

          {/* Date + Time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={`text-xs font-semibold mb-2 block ${textSub}`}>{t('date')}</label>
              <div className="relative">
                <Calendar size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className={`text-xs font-semibold mb-2 block ${textSub}`}>{t('time')}</label>
              <div className="relative">
                <Clock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
                />
              </div>
            </div>
          </div>

          {/* Location with venue suggestions */}
          <div>
            <label className={`text-xs font-semibold mb-2 block ${textSub}`}>{t('location')}</label>
            <div className="relative">
              <MapPin size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                placeholder="e.g. Arena Sport Cluj"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
              />
            </div>
            {venues.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                <p className={`text-[10px] font-semibold ${textMuted}`}>{t('suggestedVenues')}</p>
                <VenueMap
                  venues={venues}
                  selectedVenue={venues.find((v) => location.includes(v.name))}
                  onSelectVenue={(v) => setLocation(`${v.name}, ${v.address}`)}
                  height="180px"
                />
                {venues.slice(0, 3).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setLocation(`${v.name}, ${v.address}`)}
                    className={`text-left text-xs px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      location.includes(v.name)
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : dark
                          ? 'border-dark-border bg-dark-card text-dark-text hover:border-dark-muted'
                          : 'border-warm-200 bg-white text-warm-700 hover:border-warm-500'
                    }`}
                  >
                    <span className="font-medium">{v.name}</span>
                    <span className={textMuted}> — {v.address}</span>
                    <span className={`ml-2 ${textMuted}`}>
                      {v.price_per_hour ? `${v.price_per_hour} RON/h` : 'Free'}
                    </span>
                    {v.rating && (
                      <span className="ml-1 inline-flex items-center gap-0.5">
                        <Star size={9} className="text-amber-400 fill-amber-400" />
                        {v.rating}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Max players */}
          <div>
            <label className={`text-xs font-semibold mb-2 block ${textSub}`}>{t('maxPlayers')}</label>
            <div className="relative">
              <Users size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="number"
                placeholder="10"
                min="2"
                max="30"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`text-xs font-semibold mb-2 block ${textSub}`}>{t('descriptionOptional')}</label>
            <textarea
              placeholder="Any details players should know..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition resize-y ${inputClass}`}
            />
          </div>

          {/* Public toggle */}
          <div className={`flex items-center justify-between p-4 rounded-xl ${dark ? 'bg-dark-card' : 'bg-warm-50'}`}>
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe size={18} className="text-green-700" />
              ) : (
                <Lock size={18} className={textMuted} />
              )}
              <div>
                <p className={`text-sm font-semibold ${textMain}`}>{isPublic ? t('publicEvent') : t('privateEvent')}</p>
                <p className={`text-xs mt-0.5 ${textMuted}`}>
                  {isPublic ? t('anyoneCanJoin') : t('inviteOnly')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full relative cursor-pointer border-none transition-colors ${
                isPublic ? 'bg-green-500' : dark ? 'bg-dark-border' : 'bg-warm-200'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  isPublic ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border-none disabled:opacity-60"
          >
            <Plus size={18} />
            {creating ? t('creating') : t('createEvent')}
          </button>
        </form>
      </div>
    </div>
  );
}
