import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../scripts/useAuth';
import { useTheme } from '../scripts/useTheme';
import { useLanguage } from '../scripts/useLanguage';
import { Mail, Lock, LogIn, Activity } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { dark } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  const inputClass = dark
    ? 'bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted'
    : 'bg-white border-warm-200';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-5 ${dark ? 'bg-dark-bg' : 'bg-warm-white'}`}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dark ? 'bg-green-900/40' : 'bg-green-100'}`}>
            <Activity size={32} className="text-green-700" />
          </div>
          <h1 className="text-2xl font-bold text-green-800">ShowUp2Move</h1>
          <p className={`text-sm mt-1 ${dark ? 'text-dark-muted' : 'text-warm-500'}`}>Find people. Pick a sport. Just show up.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${dark ? 'text-dark-muted' : 'text-warm-500'}`} />
            <input
              type="email"
              placeholder={t('emailAddress')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
            />
          </div>

          <div className="relative">
            <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${dark ? 'text-dark-muted' : 'text-warm-500'}`} />
            <input
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer mt-2"
          >
            <LogIn size={18} />
            {loading ? t('signingIn') : t('logIn')}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${dark ? 'text-dark-muted' : 'text-warm-500'}`}>
          {t('dontHaveAccount')}{' '}
          <Link to="/register" className="text-green-700 font-semibold hover:underline">
            {t('signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
