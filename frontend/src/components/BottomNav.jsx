import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, User } from 'lucide-react';

const tabs = [
  { id: '/home', label: 'Home', Icon: Home },
  { id: '/events', label: 'Events', Icon: CalendarDays },
  { id: '/profile', label: 'Profile', Icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="sticky bottom-0 flex justify-around items-center py-2 border-t border-warm-100 bg-white z-50">
      {tabs.map((tab) => {
        const active = location.pathname.startsWith(tab.id);
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs border-none bg-transparent cursor-pointer transition-colors ${
              active ? 'text-green-700 font-semibold' : 'text-warm-500'
            }`}
          >
            <tab.Icon size={22} strokeWidth={active ? 2.5 : 2} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
