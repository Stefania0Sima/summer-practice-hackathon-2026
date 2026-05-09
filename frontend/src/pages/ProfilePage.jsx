import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../scripts/useAuth';
import { api } from '../config/api';
import { Edit, LogOut, Trophy, Flame, Users, MapPin, Check, X, Camera, Star, Pen, Sparkles, Loader2, Moon, Sun, Globe } from 'lucide-react';
import { SportIcon } from '../components/SportIcons';
import { useToast } from '../components/Toast';
import { useTheme } from '../scripts/useTheme';
import { useLanguage } from '../scripts/useLanguage';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { dark, toggle: toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoSuggestions, setPhotoSuggestions] = useState(null);

  useEffect(() => {
    api.get('/api/users/me').then((data) => {
      setProfile(data);
      setName(data.name || '');
      setBio(data.bio || '');
      setCity(data.city || '');
    }).catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.put('/api/users/me', { name, bio, city });
      updateUser({ name });
      setProfile((p) => ({ ...p, name, bio, city }));
      setEditing(false);
      toast(t('profileUpdated'));
    } catch {
      toast(t('failedSave'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/users/me/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      });
      const data = await res.json();
      setProfile((p) => ({ ...p, avatar_url: data.avatar_url }));
      toast(t('photoUploaded'));
    } catch {
      toast(t('failedUpload'), 'error');
    }
  }

  async function handleAnalyzePhoto() {
    setAnalyzingPhoto(true);
    try {
      const result = await api.post('/api/ai/analyze-photo');
      setPhotoSuggestions(result);
    } catch {}
    finally { setAnalyzingPhoto(false); }
  }

  const BADGE_ICONS = {
    trophy: Trophy,
    users: Users,
    flame: Flame,
    star: Star,
    pen: Pen,
    camera: Camera,
  };

  const displayName = profile?.name || user?.name || 'User';
  const initials = displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const cardClass = dark ? 'bg-dark-card rounded-2xl border border-dark-border' : 'bg-white rounded-2xl border border-warm-100';
  const textMain = dark ? 'text-dark-text' : 'text-warm-900';
  const textMuted = dark ? 'text-dark-muted' : 'text-warm-500';
  const textSub = dark ? 'text-dark-text' : 'text-warm-700';
  const inputClass = dark
    ? 'bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted'
    : 'bg-white border-warm-200';

  return (
    <div className="flex-1 px-5 pt-8 pb-6">
      <div className="max-w-sm mx-auto">
        {/* Avatar + info */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-[72px] h-[72px] rounded-full object-cover mx-auto mb-3" />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-green-200 flex items-center justify-center text-xl font-bold text-green-800 mx-auto mb-3">
                {initials}
              </div>
            )}
            <label className="absolute bottom-2 right-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center cursor-pointer border-2 border-white">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`text-lg font-bold text-center border rounded-lg px-3 py-1 w-full ${textMain} ${inputClass}`}
            />
          ) : (
            <h2 className={`text-lg font-bold ${textMain}`}>{displayName}</h2>
          )}

          {profile?.city && !editing && (
            <p className={`flex items-center justify-center gap-1 text-xs mt-1 ${textMuted}`}>
              <MapPin size={12} />
              {profile.city}
            </p>
          )}
        </div>

        {/* Theme & Language toggles */}
        <div className={`${cardClass} p-4 mb-3`}>
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border transition-colors ${
                dark
                  ? 'bg-dark-bg border-dark-border text-dark-text hover:bg-dark-hover'
                  : 'bg-warm-50 border-warm-200 text-warm-700 hover:bg-warm-100'
              }`}
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
              {dark ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={() => setLang(lang === 'en' ? 'ro' : 'en')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border transition-colors ${
                dark
                  ? 'bg-dark-bg border-dark-border text-dark-text hover:bg-dark-hover'
                  : 'bg-warm-50 border-warm-200 text-warm-700 hover:bg-warm-100'
              }`}
            >
              <Globe size={14} />
              {lang === 'en' ? '🇷🇴 Română' : '🇬🇧 English'}
            </button>
          </div>
        </div>

        {/* XP & Level */}
        {profile?.xp !== undefined && (
          <div className={`${cardClass} p-4 mb-3`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-semibold ${textMain}`}>{t('level')} {profile.level || 1}</h3>
              <span className={`text-xs ${textMuted}`}>{profile.xp || 0} XP</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${dark ? 'bg-dark-border' : 'bg-warm-100'}`}>
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${((profile.xp || 0) % 50) * 2}%` }}
              />
            </div>
            <p className={`text-[10px] mt-1 ${textMuted}`}>{50 - ((profile.xp || 0) % 50)} {t('xpToNext')}</p>
            {profile.events_joined > 0 && (
              <p className={`text-xs mt-1 ${textMuted}`}>{profile.events_joined} {t('eventsJoined')}</p>
            )}
          </div>
        )}

        {/* Badges */}
        {profile?.badges?.length > 0 && (
          <div className={`${cardClass} p-4 mb-3`}>
            <h3 className={`text-sm font-semibold mb-3 ${textMain}`}>{t('badges')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.badges.map((badge) => {
                const Icon = BADGE_ICONS[badge.icon] || Trophy;
                return (
                  <div key={badge.key} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl ${
                    dark ? 'bg-green-900/30' : 'bg-green-50'
                  }`}>
                    <Icon size={20} className="text-green-700" />
                    <span className={`text-[10px] font-semibold text-center ${dark ? 'text-green-400' : 'text-green-800'}`}>{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Photo analysis */}
        {profile?.avatar_url && (
          <button
            onClick={handleAnalyzePhoto}
            disabled={analyzingPhoto}
            type="button"
            className="w-full bg-purple-50 rounded-xl px-4 py-3 mb-3 flex items-center gap-2.5 cursor-pointer border border-purple-200 hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            {analyzingPhoto ? (
              <Loader2 size={16} className="text-purple-700 animate-spin shrink-0" />
            ) : (
              <Sparkles size={16} className="text-purple-700 shrink-0" />
            )}
            <p className="text-xs text-purple-800 text-left leading-relaxed">
              {analyzingPhoto ? t('analyzingPhoto') : t('analyzePhoto')}
            </p>
          </button>
        )}

        {photoSuggestions?.sports?.length > 0 && (
          <div className="bg-purple-50 rounded-xl px-4 py-3 mb-3 border border-purple-200">
            <p className="text-xs font-semibold text-purple-800 mb-1">{t('aiDetected')}</p>
            <p className="text-xs text-purple-700">{photoSuggestions.sports.join(', ')}</p>
          </div>
        )}

        {/* Bio */}
        <div className={`${cardClass} p-4 mb-3`}>
          <h3 className={`text-sm font-semibold mb-2 ${textMain}`}>{t('about')}</h3>
          {editing ? (
            <>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell people about yourself and what sports you enjoy..."
                className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-green-500 resize-y ${inputClass}`}
              />
              <div className="mt-2">
                <label className={`text-xs font-semibold mb-1 block ${textSub}`}>{t('yourCity')}</label>
                <div className="relative">
                  <MapPin size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t('yourCity')}
                    className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-green-500 ${inputClass}`}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className={`text-xs leading-relaxed ${textSub}`}>
              {profile?.bio || t('noBioYet')}
            </p>
          )}
        </div>

        {/* Sports */}
        <div className={`${cardClass} p-4 mb-3`}>
          <h3 className={`text-sm font-semibold mb-3 ${textMain}`}>{t('mySports')}</h3>
          {profile?.sports?.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {profile.sports.map((sport) => (
                <div key={sport.sport_key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <SportIcon sportId={sport.sport_key} size={20} className="text-green-700" />
                    <span className={`text-sm font-medium ${textMain}`}>{sport.sport_name}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    dark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-800'
                  }`}>
                    {sport.skill_level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-xs ${textMuted}`}>{t('noSportsYet')}</p>
          )}
        </div>

        {/* Actions */}
        {editing ? (
          <div className="flex gap-2 mb-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-none hover:bg-green-700 transition-colors"
            >
              <Check size={16} />
              {saving ? t('saving') : t('save')}
            </button>
            <button
              onClick={() => setEditing(false)}
              className={`px-5 py-3 rounded-xl border-[1.5px] text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                dark
                  ? 'border-dark-border bg-dark-card text-dark-text hover:bg-dark-hover'
                  : 'border-warm-200 bg-white text-warm-700 hover:bg-warm-50'
              }`}
            >
              <X size={16} />
              {t('cancel')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className={`w-full py-3 rounded-xl border-[1.5px] font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors mb-2 ${
              dark
                ? 'border-dark-border bg-dark-card text-dark-text hover:bg-dark-hover'
                : 'border-warm-200 bg-white text-warm-700 hover:bg-warm-50'
            }`}
          >
            <Edit size={16} />
            {t('editProfile')}
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-transparent border-none text-red-500 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          {t('logOut')}
        </button>
      </div>
    </div>
  );
}
