import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, Sparkles, MapPin } from 'lucide-react';
import { SPORTS, SKILL_LEVELS } from '../config/sports';
import { SportIcon } from '../components/SportIcons';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedSports, setSelectedSports] = useState([]);
  const [skillLevels, setSkillLevels] = useState({});
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');

  function toggleSport(id) {
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleFinish() {
    // TODO: POST to backend when API is ready
    navigate('/home');
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

            {/* Avatar placeholder */}
            <div className="flex flex-col items-center mb-6">
              <button className="w-20 h-20 rounded-full bg-green-100 border-2 border-dashed border-green-400 flex items-center justify-center cursor-pointer hover:bg-green-200 transition-colors">
                <Camera size={28} className="text-green-700" />
              </button>
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

            <div className="bg-green-50 rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5">
              <Sparkles size={16} className="text-green-700 mt-0.5 shrink-0" />
              <p className="text-xs text-green-800 leading-relaxed">
                Our AI reads your bio to suggest sports and find compatible players. The more you write, the better your matches!
              </p>
            </div>

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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Let's go!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
