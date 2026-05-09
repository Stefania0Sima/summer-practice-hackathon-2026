import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, User } from 'lucide-react';
import { useTheme } from '../scripts/useTheme';
import { useLanguage } from '../scripts/useLanguage';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { t } = useLanguage();

  const tabs = [
    { id: '/home', label: t('home'), Icon: Home },
    { id: '/events', label: t('events'), Icon: CalendarDays },
    { id: '/profile', label: t('profile'), Icon: User },
  ];

  return (
    <nav className={`sticky bottom-0 flex justify-around items-center py-2 border-t z-50 ${
      dark ? 'border-dark-border bg-dark-card' : 'border-warm-100 bg-white'
    }`}>
      {tabs.map((tab) => {
        const active = location.pathname.startsWith(tab.id);
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs border-none bg-transparent cursor-pointer transition-colors ${
              active
                ? 'text-green-700 font-semibold'
                : dark ? 'text-dark-muted' : 'text-warm-500'
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
