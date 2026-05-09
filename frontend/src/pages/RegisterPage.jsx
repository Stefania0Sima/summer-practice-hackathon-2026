import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../scripts/useAuth';
import { useTheme } from '../scripts/useTheme';
import { useLanguage } from '../scripts/useLanguage';
import { Mail, Lock, UserPlus, User } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();
  const { dark } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup(email, password, name);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  }

  const inputClass = dark
    ? 'bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted'
    : 'bg-white border-warm-200';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-5 ${dark ? 'bg-dark-bg' : 'bg-warm-white'}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-800">Create account</h1>
          <p className={`text-sm mt-1 ${dark ? 'text-dark-muted' : 'text-warm-500'}`}>Takes 30 seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="relative">
            <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${dark ? 'text-dark-muted' : 'text-warm-500'}`} />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
            />
          </div>

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
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
            />
          </div>

          <div className="relative">
            <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${dark ? 'text-dark-muted' : 'text-warm-500'}`} />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer mt-2"
          >
            <UserPlus size={18} />
            {loading ? t('creating') : 'Create account'}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${dark ? 'text-dark-muted' : 'text-warm-500'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            {t('logIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
