import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Users, MapPin } from 'lucide-react';
import { SportIcon } from '../components/SportIcons';

const MOCK_EVENTS = [
  { id: '1', sportId: 'football', title: 'Football @ Arena Sport', date: 'Today, 18:00', players: '8/10', status: 'confirmed', location: 'Str. Fabricii 12' },
  { id: '2', sportId: 'tennis', title: 'Tennis doubles', date: 'Tomorrow, 10:00', players: '3/4', status: 'waiting', location: 'Tennis Club Central' },
  { id: '3', sportId: 'basketball', title: 'Pickup basketball', date: 'Sat, 16:00', players: '6/10', status: 'confirmed', location: 'Sala Sporturilor' },
  { id: '4', sportId: 'running', title: 'Morning run - Cetățuie', date: 'Sun, 07:00', players: '4/15', status: 'waiting', location: 'Parcul Central' },
];

export default function EventsPage() {
  const navigate = useNavigate();

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

      <div className="flex flex-col gap-2.5">
        {MOCK_EVENTS.map((ev) => (
          <button
            key={ev.id}
            onClick={() => navigate(`/events/${ev.id}`)}
            className="w-full bg-white rounded-2xl border border-warm-100 p-4 text-left cursor-pointer hover:border-warm-200 transition-colors"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                <SportIcon sportId={ev.sportId} size={22} className="text-green-700" />
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
                    {ev.date}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-warm-500">
                    <Users size={11} />
                    {ev.players}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-warm-500">
                    <MapPin size={11} />
                    {ev.location}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
