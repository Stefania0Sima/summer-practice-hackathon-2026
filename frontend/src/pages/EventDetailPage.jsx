import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../scripts/useAuth';
import { api } from '../config/api';
import { ArrowLeft, Crown, MapPin, Send, BarChart3, Clock, Users, UserPlus, LogOut, Share2, Check, Sparkles, CalendarPlus, CloudSun, Plus, X } from 'lucide-react';
import { SportIcon } from '../components/SportIcons';
import VenueMap from '../components/VenueMap';
import { useToast } from '../components/Toast';
import { useTheme } from '../scripts/useTheme';
import { useLanguage } from '../scripts/useLanguage';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { dark } = useTheme();
  const { t } = useLanguage();
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [venueData, setVenueData] = useState([]);
  const [weather, setWeather] = useState(null);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const chatEndRef = useRef(null);

  const cardClass = dark ? 'bg-dark-card border-dark-border' : 'bg-white border-warm-100';
  const textMain = dark ? 'text-dark-text' : 'text-warm-900';
  const textMuted = dark ? 'text-dark-muted' : 'text-warm-500';
  const inputClass = dark
    ? 'bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted'
    : 'bg-white border-warm-200';

  const isParticipant = event?.participants?.some((p) => p.id === user?.id);
  const isCaptain = event?.captain_id === user?.id;

  useEffect(() => {
    loadAll();
  }, [id]);

  useEffect(() => {
    if (!isParticipant) return;
    const interval = setInterval(() => {
      api.get(`/api/events/${id}/messages`).then(setMessages).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [id, isParticipant]);

  async function loadAll() {
    setLoading(true);
    try {
      const ev = await api.get(`/api/events/${id}`);
      setEvent(ev);
      if (ev.sport_key) {
        api.get(`/api/venues?sport_key=${ev.sport_key}`).then((v) => {
          const matched = v.filter((venue) => ev.location && ev.location.includes(venue.name));
          setVenueData(matched.length > 0 ? matched : v.slice(0, 3));
        }).catch(() => {});
      }
      if (ev.date) {
        api.get(`/api/ai/weather?date=${ev.date}&city=${encodeURIComponent(ev.location || 'Cluj-Napoca')}`).then(setWeather).catch(() => {});
      }
      if (ev.participants?.some((p) => p.id === user?.id)) {
        const [msgs, plls] = await Promise.all([
          api.get(`/api/events/${id}/messages`),
          api.get(`/api/events/${id}/polls`),
        ]);
        setMessages(msgs);
        setPolls(plls);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!msgInput.trim() || sending) return;
    setSending(true);
    try {
      const msg = await api.post(`/api/events/${id}/messages`, { text: msgInput });
      setMessages((prev) => [...prev, msg]);
      setMsgInput('');
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      toast('Failed to send message', 'error');
    } finally { setSending(false); }
  }

  async function handleJoin() {
    try {
      await api.post(`/api/events/${id}/join`);
      toast('You joined the event! +10 XP');
      await loadAll();
    } catch {
      toast('Failed to join event', 'error');
    }
  }

  async function handleLeave() {
    try {
      await api.post(`/api/events/${id}/leave`);
      toast(t('leaveEvent'), 'info');
      await loadAll();
    } catch {
      toast('Failed to leave event', 'error');
    }
  }

  async function handleShare() {
    const url = window.location.href;
    const text = `Join "${event.title}" on ShowUp2Move! ${event.date}${event.time ? ` at ${event.time}` : ''}${event.location ? ` — ${event.location}` : ''}`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleCalendarDownload() {
    window.open(`/api/events/${id}/calendar`, '_blank');
  }

  async function handleVote(pollId, optionId) {
    try {
      const updated = await api.post(`/api/polls/${pollId}/vote`, { option_id: optionId });
      setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
    } catch {}
  }

  async function handleCreatePoll() {
    const validOptions = pollOptions.filter((o) => o.trim());
    if (!pollQuestion.trim() || validOptions.length < 2) {
      toast('Add a question and at least 2 options', 'error');
      return;
    }
    setCreatingPoll(true);
    try {
      const newPoll = await api.post(`/api/events/${id}/polls`, {
        question: pollQuestion,
        options: validOptions,
      });
      setPolls((prev) => [newPoll, ...prev]);
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPollForm(false);
      toast('Poll created!');
    } catch {
      toast('Failed to create poll', 'error');
    } finally {
      setCreatingPoll(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className={`text-sm ${textMuted}`}>{t('loadingEvent')}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <p className={`text-sm mb-4 ${textMuted}`}>{t('eventNotFound')}</p>
        <button onClick={() => navigate(-1)} className="text-green-700 text-sm font-semibold cursor-pointer bg-transparent border-none">{t('goBack')}</button>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 pt-5 pb-6 overflow-y-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className={`flex items-center gap-1.5 text-sm bg-transparent border-none cursor-pointer mb-4 ${textMuted}`}
      >
        <ArrowLeft size={16} />
        {t('back')}
      </button>

      {/* Event header */}
      <div className={`rounded-2xl border p-5 mb-4 ${cardClass}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dark ? 'bg-green-900/40' : 'bg-green-50'}`}>
            <SportIcon sportId={event.sport_key} size={26} className="text-green-700" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${textMain}`}>{event.title}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                <Clock size={12} />
                {event.date}{event.time ? `, ${event.time}` : ''}
              </span>
              <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                <Users size={12} />
                {event.participant_count}/{event.max_players}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {event.location && (
            <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
              dark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-800'
            }`}>
              <MapPin size={12} />
              {event.location}
            </span>
          )}
          {event.captain_name && (
            <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
              dark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700'
            }`}>
              <Crown size={12} />
              {t('captain')}: {event.captain_name}
            </span>
          )}
        </div>
        {event.description && (
          <p className={`text-xs mt-3 leading-relaxed ${dark ? 'text-dark-text' : 'text-warm-700'}`}>{event.description}</p>
        )}

        {/* Action row */}
        <div className={`flex items-center gap-2 mt-3 pt-3 border-t flex-wrap ${dark ? 'border-dark-border' : 'border-warm-100'}`}>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer border-none transition-colors ${
              dark ? 'bg-dark-bg text-dark-text hover:bg-dark-hover' : 'bg-warm-50 text-warm-700 hover:bg-warm-100'
            }`}
          >
            {copied ? <Check size={12} className="text-green-600" /> : <Share2 size={12} />}
            {copied ? t('copied') : t('share')}
          </button>
          <button
            onClick={handleCalendarDownload}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer border-none transition-colors ${
              dark ? 'bg-dark-bg text-dark-text hover:bg-dark-hover' : 'bg-warm-50 text-warm-700 hover:bg-warm-100'
            }`}
          >
            <CalendarPlus size={12} />
            {t('addToCalendar')}
          </button>
          {event.compatibility_score && (
            <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
              dark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-800'
            }`}>
              <Sparkles size={12} />
              {event.compatibility_score}% {t('compatible')}
            </span>
          )}
        </div>
      </div>

      {/* Weather */}
      {weather && (
        <div className={`rounded-xl px-4 py-3 mb-4 flex items-center gap-3 ${weather.outdoor_ok ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
          <CloudSun size={20} className={weather.outdoor_ok ? 'text-blue-600' : 'text-amber-600'} />
          <p className={`text-xs ${weather.outdoor_ok ? 'text-blue-800' : 'text-amber-800'}`}>{weather.recommendation}</p>
        </div>
      )}

      {/* Map */}
      {venueData.length > 0 && (
        <div className="mb-4">
          <VenueMap venues={venueData} height="180px" />
        </div>
      )}

      {/* Join / Leave button */}
      {!isParticipant ? (
        <button
          onClick={handleJoin}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer border-none transition-colors mb-4"
        >
          <UserPlus size={16} />
          {t('joinEvent')}
        </button>
      ) : (
        <button
          onClick={handleLeave}
          className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-red-100 transition-colors mb-4"
        >
          <LogOut size={14} />
          {t('leaveEvent')}
        </button>
      )}

      {/* Players strip */}
      <div className="mb-4">
        <h3 className={`text-sm font-semibold mb-3 ${textMain}`}>{t('players')}</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {event.participants.map((p) => {
            const initials = (p.name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={p.id} className="flex flex-col items-center min-w-[56px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                    p.is_captain ? 'bg-amber-400 text-warm-900' : dark ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {initials}
                </div>
                <span className={`text-[10px] text-center ${textMuted}`}>{(p.name || 'User').split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Polls */}
      {isCaptain && isParticipant && (
        <div className="mb-4">
          {!showPollForm ? (
            <button
              onClick={() => setShowPollForm(true)}
              className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                dark
                  ? 'border-dark-muted bg-dark-card text-dark-text hover:bg-dark-hover'
                  : 'border-warm-300 bg-warm-50 text-warm-700 hover:bg-warm-100'
              }`}
            >
              <Plus size={14} />
              {t('createPoll')}
            </button>
          ) : (
            <div className={`rounded-2xl border p-4 ${cardClass}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold flex items-center gap-2 ${textMain}`}>
                  <BarChart3 size={16} />
                  {t('newPoll')}
                </h3>
                <button onClick={() => setShowPollForm(false)} className={`bg-transparent border-none cursor-pointer p-0 ${textMuted}`}>
                  <X size={16} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Question — e.g. What time works best?"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-green-500 mb-2 ${inputClass}`}
              />
              {pollOptions.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[i] = e.target.value;
                    setPollOptions(next);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-green-500 mb-1.5 ${inputClass}`}
                />
              ))}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setPollOptions((prev) => [...prev, ''])}
                  className="text-xs text-green-700 bg-transparent border-none cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} />
                  {t('addOption')}
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleCreatePoll}
                  disabled={creatingPoll}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg cursor-pointer border-none transition-colors disabled:opacity-60"
                >
                  {creatingPoll ? t('creating') : t('create')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {polls.map((poll) => (
        <div key={poll.id} className={`rounded-2xl border p-4 mb-4 ${cardClass}`}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className={dark ? 'text-dark-text' : 'text-warm-700'} />
            <h3 className={`text-sm font-semibold ${textMain}`}>{poll.question}</h3>
          </div>
          {poll.options.map((opt) => {
            const voted = poll.user_vote === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleVote(poll.id, opt.id)}
                className={`w-full relative p-3.5 border-[1.5px] rounded-xl mb-2 cursor-pointer overflow-hidden text-left transition-colors ${
                  voted
                    ? 'border-green-500'
                    : dark ? 'border-dark-border hover:border-dark-muted' : 'border-warm-200 hover:border-warm-500'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ${
                    voted ? dark ? 'bg-green-900/30' : 'bg-green-50' : dark ? 'bg-dark-hover' : 'bg-warm-50'
                  }`}
                  style={{ width: `${opt.percentage}%` }}
                />
                <div className="relative flex justify-between items-center">
                  <div>
                    <p className={`text-sm font-semibold ${textMain}`}>{opt.text}</p>
                    {opt.extra && (
                      <p className={`text-xs mt-0.5 ${textMuted}`}>{opt.extra}</p>
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${voted ? 'text-green-700' : textMuted}`}>
                    {opt.percentage}%
                  </span>
                </div>
              </button>
            );
          })}
          <p className={`text-[10px] text-right ${textMuted}`}>
            {poll.total_votes} {poll.total_votes !== 1 ? t('votes') : t('vote')}
          </p>
        </div>
      ))}

      {/* Chat */}
      {isParticipant && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Send size={14} className={dark ? 'text-dark-text' : 'text-warm-700'} />
            <h3 className={`text-sm font-semibold ${textMain}`}>{t('groupChat')}</h3>
          </div>
          <div className="flex flex-col gap-2.5 mb-3 max-h-80 overflow-y-auto">
            {messages.length === 0 ? (
              <p className={`text-xs text-center py-4 ${textMuted}`}>{t('noMessages')}</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold ${textMain}`}>
                      {msg.sender_id === user?.id ? t('you') : msg.sender_name}
                    </span>
                    {msg.is_captain && (
                      <span className="flex items-center gap-0.5 text-[9px] bg-amber-400 text-warm-900 px-1.5 py-0.5 rounded-full font-semibold">
                        <Crown size={8} />
                        {t('captain')}
                      </span>
                    )}
                    <span className={`text-[10px] ${textMuted}`}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed px-3.5 py-2.5 rounded-xl ${
                      msg.sender_id === user?.id
                        ? dark ? 'bg-green-900/30' : 'bg-green-50'
                        : dark ? 'bg-dark-hover' : 'bg-warm-50'
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('typeMessage')}
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className={`flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition ${inputClass}`}
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl cursor-pointer border-none transition-colors disabled:opacity-60"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
