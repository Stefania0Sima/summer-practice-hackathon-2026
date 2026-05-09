import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText, Globe, Lock, Plus } from 'lucide-react';
import { SPORTS } from '../config/sports';
import { SportIcon } from '../components/SportIcons';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  function handleCreate(e) {
    e.preventDefault();
    // TODO: POST to API
    navigate('/home');
  }

  return (
    <div className="min-h-screen bg-warm-white px-5 py-5">
      <div className="max-w-sm mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-warm-500 bg-transparent border-none cursor-pointer mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h2 className="text-xl font-bold text-warm-900 mb-1">Create event</h2>
        <p className="text-sm text-warm-500 mb-6">Set up a game and invite players</p>

        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          {/* Sport picker */}
          <div>
            <label className="text-xs font-semibold text-warm-700 mb-2 block">Sport</label>
            <div className="flex gap-2 flex-wrap">
              {SPORTS.map((sport) => {
                const active = selectedSport === sport.id;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setSelectedSport(sport.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-[1.5px] text-xs cursor-pointer transition-all ${
                      active
                        ? 'bg-green-50 border-green-500 text-green-800 font-semibold'
                        : 'bg-white border-warm-200 text-warm-700 hover:border-warm-500'
                    }`}
                  >
                    <SportIcon sportId={sport.id} size={14} strokeWidth={active ? 2.5 : 2} />
                    {sport.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-warm-700 mb-2 block">Title</label>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-500" />
              <input
                type="text"
                placeholder="e.g. Friday evening football"
                className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
              />
            </div>
          </div>

          {/* Date + Time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-warm-700 mb-2 block">Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-500" />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-3 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-warm-700 mb-2 block">Time</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-500" />
                <input
                  type="time"
                  className="w-full pl-10 pr-3 py-3 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-warm-700 mb-2 block">Location</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-500" />
              <input
                type="text"
                placeholder="e.g. Arena Sport Cluj, Str. Fabricii 12"
                className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
              />
            </div>
          </div>

          {/* Max players */}
          <div>
            <label className="text-xs font-semibold text-warm-700 mb-2 block">Max players</label>
            <div className="relative">
              <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-500" />
              <input
                type="number"
                placeholder="10"
                min="2"
                max="30"
                className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-warm-700 mb-2 block">Description (optional)</label>
            <textarea
              placeholder="Any details players should know..."
              rows={3}
              className="w-full px-4 py-3 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition resize-y"
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe size={18} className="text-green-700" />
              ) : (
                <Lock size={18} className="text-warm-500" />
              )}
              <div>
                <p className="text-sm font-semibold">{isPublic ? 'Public event' : 'Private event'}</p>
                <p className="text-xs text-warm-500 mt-0.5">
                  {isPublic ? 'Anyone can find and join' : 'Invite only'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full relative cursor-pointer border-none transition-colors ${
                isPublic ? 'bg-green-500' : 'bg-warm-200'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  isPublic ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
          >
            <Plus size={18} />
            Create event
          </button>
        </form>
      </div>
    </div>
  );
}
