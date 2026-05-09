import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { Plus, Clock, Users, MapPin, Search, X } from 'lucide-react';
import { SportIcon } from '../components/SportIcons';
import { SPORTS } from '../config/sports';
import { useTheme } from '../scripts/useTheme';
import { useLanguage } from '../scripts/useLanguage';

export default function EventsPage() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState(null);

  useEffect(() => {
    api.get('/api/events').then(setEvents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = events;
    if (sportFilter) {
      result = result.filter((ev) => ev.sport_key === sportFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((ev) =>
        ev.title?.toLowerCase().includes(q) ||
        ev.location?.toLowerCase().includes(q) ||
        ev.date?.includes(q)
      );
    }
    return result;
  }, [events, search, sportFilter]);

  return (
    <div className="flex-1 px-5 pt-5 pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className={`text-xl font-bold ${dark ? 'text-dark-text' : 'text-warm-900'}`}>{t('events')}</h1>
        <button
          onClick={() => navigate('/events/create')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg cursor-pointer border-none hover:bg-green-700 transition-colors"
        >
          <Plus size={14} />
          {t('new')}
        </button>
      </div>

      {/* Search */}
      <div className={`relative mb-3 ${dark ? 'text-dark-text' : ''}`}>
        <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${dark ? 'text-dark-muted' : 'text-warm-500'}`} />
        <input
          type="text"
          placeholder={t('searchEvents')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-10 pr-9 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${
            dark
              ? 'bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted'
              : 'bg-white border-warm-200 text-warm-900'
          }`}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className={`absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 ${dark ? 'text-dark-muted' : 'text-warm-500'}`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Sport filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-1">
        <button
          onClick={() => setSportFilter(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
            !sportFilter
              ? 'bg-green-600 text-white border-green-600'
              : dark
                ? 'bg-dark-card border-dark-border text-dark-muted hover:border-dark-muted'
                : 'bg-white border-warm-200 text-warm-700 hover:border-warm-500'
          }`}
        >
          {t('allSports')}
        </button>
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setSportFilter(sportFilter === sport.id ? null : sport.id)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
              sportFilter === sport.id
                ? 'bg-green-50 border-green-500 text-green-800'
                : dark
                  ? 'bg-dark-card border-dark-border text-dark-muted hover:border-dark-muted'
                  : 'bg-white border-warm-200 text-warm-700 hover:border-warm-500'
            }`}
          >
            <SportIcon sportId={sport.id} size={12} />
            {sport.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`text-center py-12 text-sm ${dark ? 'text-dark-muted' : 'text-warm-500'}`}>{t('loadingEvents')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className={`text-sm mb-4 ${dark ? 'text-dark-muted' : 'text-warm-500'}`}>
            {events.length === 0 ? t('noEventsFirst') : `No events match your ${sportFilter ? 'sport' : 'search'}`}
          </p>
          {events.length === 0 && (
            <button
              onClick={() => navigate('/events/create')}
              className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl cursor-pointer border-none hover:bg-green-700 transition-colors"
            >
              {t('createAnEvent')}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((ev) => (
            <button
              key={ev.id}
              onClick={() => navigate(`/events/${ev.id}`)}
              className={`w-full rounded-2xl border p-4 text-left cursor-pointer transition-colors ${
                dark
                  ? 'bg-dark-card border-dark-border hover:border-dark-muted'
                  : 'bg-white border-warm-100 hover:border-warm-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  dark ? 'bg-green-900/40' : 'bg-green-50'
                }`}>
                  <SportIcon sportId={ev.sport_key} size={22} className="text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`font-semibold text-sm truncate ${dark ? 'text-dark-text' : 'text-warm-900'}`}>{ev.title}</p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        ev.status === 'confirmed'
                          ? dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-800'
                          : dark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ev.status === 'confirmed' ? t('confirmed') : t('waiting')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`flex items-center gap-1 text-xs ${dark ? 'text-dark-muted' : 'text-warm-500'}`}>
                      <Clock size={11} />
                      {ev.date}{ev.time ? `, ${ev.time}` : ''}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${dark ? 'text-dark-muted' : 'text-warm-500'}`}>
                      <Users size={11} />
                      {ev.player_count}/{ev.max_players}
                    </span>
                    {ev.location && (
                      <span className={`flex items-center gap-1 text-xs ${dark ? 'text-dark-muted' : 'text-warm-500'}`}>
                        <MapPin size={11} />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
