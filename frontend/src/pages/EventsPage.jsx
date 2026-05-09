import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { Plus, Clock, Users, MapPin } from 'lucide-react';
import { SportIcon } from '../components/SportIcons';

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/events').then(setEvents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 px-5 pt-5 pb-6">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-warm-900">Events</h1>
        <button
          onClick={() => navigate('/events/create')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg cursor-pointer border-none hover:bg-green-700 transition-colors"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-warm-500 text-sm">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-warm-500 text-sm mb-4">No events yet. Be the first to create one!</p>
          <button
            onClick={() => navigate('/events/create')}
            className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl cursor-pointer border-none hover:bg-green-700 transition-colors"
          >
            Create an event
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {events.map((ev) => (
            <button
              key={ev.id}
              onClick={() => navigate(`/events/${ev.id}`)}
              className="w-full bg-white rounded-2xl border border-warm-100 p-4 text-left cursor-pointer hover:border-warm-200 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                  <SportIcon sportId={ev.sport_key} size={22} className="text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-warm-900 truncate">{ev.title}</p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        ev.status === 'confirmed'
                          ? 'bg-green-50 text-green-800'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ev.status === 'confirmed' ? 'Confirmed' : 'Waiting'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-warm-500">
                      <Clock size={11} />
                      {ev.date}{ev.time ? `, ${ev.time}` : ''}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-warm-500">
                      <Users size={11} />
                      {ev.player_count}/{ev.max_players}
                    </span>
                    {ev.location && (
                      <span className="flex items-center gap-1 text-xs text-warm-500">
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
