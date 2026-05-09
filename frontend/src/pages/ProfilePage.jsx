import { useNavigate } from 'react-router-dom';
import { useAuth } from '../scripts/useAuth';
import { Edit, LogOut, Trophy, Flame, Users, MapPin } from 'lucide-react';
import { SportIcon } from '../components/SportIcons';

// Mock data
const MY_SPORTS = [
  { id: 'football', name: 'Football', level: 'Intermediate' },
  { id: 'tennis', name: 'Tennis', level: 'Beginner' },
  { id: 'cycling', name: 'Cycling', level: 'Advanced' },
];

const STATS = [
  { label: 'Events joined', value: '12', Icon: Trophy },
  { label: 'ShowUp streak', value: '5d', Icon: Flame },
  { label: 'Groups', value: '3', Icon: Users },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex-1 px-5 pt-8 pb-6">
      <div className="max-w-sm mx-auto">
        {/* Avatar + info */}
        <div className="text-center mb-6">
          <div className="w-[72px] h-[72px] rounded-full bg-green-200 flex items-center justify-center text-xl font-bold text-green-800 mx-auto mb-3">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-warm-900">{user?.name || 'User'}</h2>
          <p className="flex items-center justify-center gap-1 text-xs text-warm-500 mt-1">
            <MapPin size={12} />
            Cluj-Napoca
          </p>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-warm-100 p-4 mb-3">
          <h3 className="text-sm font-semibold mb-2">About</h3>
          <p className="text-xs text-warm-700 leading-relaxed">
            Weekend footballer, love 5-a-side after work. Also enjoy casual tennis and cycling around the city. Always up for trying new sports!
          </p>
        </div>

        {/* Sports */}
        <div className="bg-white rounded-2xl border border-warm-100 p-4 mb-3">
          <h3 className="text-sm font-semibold mb-3">My sports</h3>
          <div className="flex flex-col gap-2.5">
            {MY_SPORTS.map((sport) => (
              <div key={sport.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <SportIcon sportId={sport.id} size={20} className="text-green-700" />
                  <span className="text-sm font-medium">{sport.name}</span>
                </div>
                <span className="text-xs bg-green-50 text-green-800 px-2.5 py-1 rounded-full font-medium">
                  {sport.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl border border-warm-100 p-4 mb-5">
          <h3 className="text-sm font-semibold mb-3">Activity</h3>
          <div className="grid grid-cols-3 gap-2">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center p-3 bg-warm-50 rounded-xl">
                <stat.Icon size={16} className="text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-700">{stat.value}</p>
                <p className="text-[10px] text-warm-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <button className="w-full py-3 rounded-xl border-[1.5px] border-warm-200 bg-white text-warm-700 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-warm-50 transition-colors mb-2">
          <Edit size={16} />
          Edit profile
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-transparent border-none text-red-500 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </div>
  );
}
