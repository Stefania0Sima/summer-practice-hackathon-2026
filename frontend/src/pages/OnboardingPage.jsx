import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { ArrowLeft, ArrowRight, Camera, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { SPORTS, SKILL_LEVELS } from '../config/sports';
import { SportIcon } from '../components/SportIcons';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedSports, setSelectedSports] = useState([]);
  const [skillLevels, setSkillLevels] = useState({});
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [analyzingBio, setAnalyzingBio] = useState(false);

  function toggleSport(id) {
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleAnalyzeBio() {
    if (!bio.trim()) return;
    setAnalyzingBio(true);
    try {
      const result = await api.post('/api/ai/analyze-bio', { bio });
      setAiSuggestions(result);
      if (result.sports?.length > 0) {
        setSelectedSports((prev) => {
          const combined = new Set([...prev, ...result.sports]);
          return [...combined];
        });
      }
      if (result.skill_hints) {
        setSkillLevels((prev) => ({ ...prev, ...result.skill_hints }));
      }
    } catch {}
    finally { setAnalyzingBio(false); }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      await fetch('/api/users/me/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      });
    } catch {}
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await api.put('/api/users/me', { bio, city });
      const sports = selectedSports.map((key) => ({
        sport_key: key,
        skill_level: skillLevels[key] || 'Beginner',
      }));
      await api.put('/api/users/me/sports', { sports });
      navigate('/home');
    } catch {
      navigate('/home');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-warm-white px-5 py-8">
      <div className="max-w-sm mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex gap-1.5 mb-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-green-500' : 'bg-warm-100'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-warm-500">Step {step + 1} of 3</p>
        </div>

        {/* Step 0: Pick sports */}
        {step === 0 && (
          <>
            <h2 className="text-xl font-bold text-warm-900 mb-1">What do you play?</h2>
            <p className="text-sm text-warm-500 mb-5">Pick all sports you're interested in</p>

            <div className="grid grid-cols-3 gap-2.5">
              {SPORTS.map((sport) => {
                const active = selectedSports.includes(sport.id);
                return (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport.id)}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-[1.5px] cursor-pointer transition-all ${
                      active
                        ? 'bg-green-50 border-green-500 text-green-800'
                        : 'bg-white border-warm-200 text-warm-700 hover:border-warm-500'
                    }`}
                  >
                    <SportIcon sportId={sport.id} size={28} strokeWidth={active ? 2.2 : 1.8} />
                    <span className={`text-xs ${active ? 'font-semibold' : ''}`}>{sport.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => selectedSports.length > 0 && setStep(1)}
              disabled={selectedSports.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer mt-6"
            >
              Continue ({selectedSports.length} selected)
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* Step 1: Skill levels */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-warm-900 mb-1">Your skill level</h2>
            <p className="text-sm text-warm-500 mb-5">Helps us match you with similar players</p>

            <div className="flex flex-col gap-3">
              {selectedSports.map((sportId) => {
                const sport = SPORTS.find((s) => s.id === sportId);
                return (
                  <div key={sportId} className="bg-white rounded-2xl border border-warm-100 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <SportIcon sportId={sportId} size={22} className="text-green-700" />
                      <span className="font-semibold text-sm">{sport.name}</span>
                    </div>
                    <div className="flex gap-2">
                      {SKILL_LEVELS.map((level) => {
                        const active = skillLevels[sportId] === level;
                        return (
                          <button
                            key={level}
                            onClick={() => setSkillLevels((p) => ({ ...p, [sportId]: level }))}
                            className={`flex-1 py-2 text-xs rounded-lg border-[1.5px] cursor-pointer transition-all ${
                              active
                                ? 'bg-green-50 border-green-500 text-green-800 font-semibold'
                                : 'bg-white border-warm-200 text-warm-700 hover:border-warm-500'
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(0)}
                className="px-5 py-3 text-sm text-warm-700 bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* Step 2: Bio + photo + city */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-warm-900 mb-1">Almost done!</h2>
            <p className="text-sm text-warm-500 mb-5">Tell people a bit about yourself</p>

            {/* Avatar upload */}
            <div className="flex flex-col items-center mb-6">
              <label className="w-20 h-20 rounded-full bg-green-100 border-2 border-dashed border-green-400 flex items-center justify-center cursor-pointer hover:bg-green-200 transition-colors">
                <Camera size={28} className="text-green-700" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              <p className="text-xs text-warm-500 mt-2">Tap to upload photo (optional)</p>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <textarea
                placeholder="Short bio — e.g. 'Weekend footballer, love playing 5-a-side after work'"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition resize-y"
              />
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-500" />
                <input
                  type="text"
                  placeholder="City / neighborhood"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
              </div>
            </div>

            {/* AI analyze bio button */}
            <button
              onClick={handleAnalyzeBio}
              disabled={!bio.trim() || analyzingBio}
              className="w-full bg-green-50 rounded-xl px-4 py-3 mb-4 flex items-center gap-2.5 cursor-pointer border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {analyzingBio ? (
                <Loader2 size={16} className="text-green-700 animate-spin shrink-0" />
              ) : (
                <Sparkles size={16} className="text-green-700 shrink-0" />
              )}
              <p className="text-xs text-green-800 text-left leading-relaxed">
                {analyzingBio ? 'Analyzing your bio...' : 'Let AI suggest sports from your bio'}
              </p>
            </button>

            {aiSuggestions?.sports?.length > 0 && (
              <div className="bg-green-50 rounded-xl px-4 py-3 mb-4 border border-green-200">
                <p className="text-xs font-semibold text-green-800 mb-1">AI detected these sports:</p>
                <p className="text-xs text-green-700">{aiSuggestions.sports.join(', ')}</p>
                <p className="text-[10px] text-green-600 mt-1">Added to your selections on step 1</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 text-sm text-warm-700 bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Saving...' : "Let's go!"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
