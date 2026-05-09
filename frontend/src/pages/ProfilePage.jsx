import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../scripts/useAuth';
import { api } from '../config/api';
import { Edit, LogOut, Trophy, Flame, Users, MapPin, Check, X, Camera } from 'lucide-react';
import { SportIcon } from '../components/SportIcons';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

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
    } catch {
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
    } catch {}
  }

  const displayName = profile?.name || user?.name || 'User';
  const initials = displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

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
              className="text-lg font-bold text-warm-900 text-center border border-warm-200 rounded-lg px-3 py-1 w-full"
            />
          ) : (
            <h2 className="text-lg font-bold text-warm-900">{displayName}</h2>
          )}

          {profile?.city && !editing && (
            <p className="flex items-center justify-center gap-1 text-xs text-warm-500 mt-1">
              <MapPin size={12} />
              {profile.city}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-warm-100 p-4 mb-3">
          <h3 className="text-sm font-semibold mb-2">About</h3>
          {editing ? (
            <>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell people about yourself and what sports you enjoy..."
                className="w-full px-3 py-2 border border-warm-200 rounded-xl text-xs bg-white focus:outline-none focus:border-green-500 resize-y"
              />
              <div className="mt-2">
                <label className="text-xs font-semibold text-warm-700 mb-1 block">City</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Your city"
                    className="w-full pl-9 pr-3 py-2 border border-warm-200 rounded-xl text-xs bg-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-warm-700 leading-relaxed">
              {profile?.bio || 'No bio yet. Tap edit to add one!'}
            </p>
          )}
        </div>

        {/* Sports */}
        <div className="bg-white rounded-2xl border border-warm-100 p-4 mb-3">
          <h3 className="text-sm font-semibold mb-3">My sports</h3>
          {profile?.sports?.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {profile.sports.map((sport) => (
                <div key={sport.sport_key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <SportIcon sportId={sport.sport_key} size={20} className="text-green-700" />
                    <span className="text-sm font-medium">{sport.sport_name}</span>
                  </div>
                  <span className="text-xs bg-green-50 text-green-800 px-2.5 py-1 rounded-full font-medium">
                    {sport.skill_level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-warm-500">No sports selected yet. Complete onboarding to add sports!</p>
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
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-5 py-3 rounded-xl border-[1.5px] border-warm-200 bg-white text-warm-700 text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-warm-50 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full py-3 rounded-xl border-[1.5px] border-warm-200 bg-white text-warm-700 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-warm-50 transition-colors mb-2"
          >
            <Edit size={16} />
            Edit profile
          </button>
        )}
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
