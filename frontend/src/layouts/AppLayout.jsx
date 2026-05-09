import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../scripts/useTheme';

export default function AppLayout() {
  const { dark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col max-w-lg mx-auto ${dark ? 'bg-dark-bg' : 'bg-warm-white'}`}>
      <Outlet />
      <BottomNav />
    </div>
  );
}
