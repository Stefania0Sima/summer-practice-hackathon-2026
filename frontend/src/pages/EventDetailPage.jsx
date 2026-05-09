import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../scripts/useAuth';
import { api } from '../config/api';
import { ArrowLeft, Crown, MapPin, DollarSign, Send, BarChart3, Clock, Users, UserPlus, LogOut } from 'lucide-react';
import { SportIcon } from '../components/SportIcons';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const isParticipant = event?.participants?.some((p) => p.id === user?.id);

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
    } catch {}
    finally { setSending(false); }
  }

  async function handleJoin() {
    try {
      await api.post(`/api/events/${id}/join`);
      await loadAll();
    } catch {}
  }

  async function handleLeave() {
    try {
      await api.post(`/api/events/${id}/leave`);
      await loadAll();
    } catch {}
  }

  async function handleVote(pollId, optionId) {
    try {
      const updated = await api.post(`/api/polls/${pollId}/vote`, { option_id: optionId });
      setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-warm-500 text-sm">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <p className="text-warm-500 text-sm mb-4">Event not found</p>
        <button onClick={() => navigate(-1)} className="text-green-700 text-sm font-semibold cursor-pointer bg-transparent border-none">Go back</button>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 pt-5 pb-6 overflow-y-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-warm-500 bg-transparent border-none cursor-pointer mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Event header */}
      <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <SportIcon sportId={event.sport_key} size={26} className="text-green-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-warm-900">{event.title}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-warm-500">
                <Clock size={12} />
                {event.date}{event.time ? `, ${event.time}` : ''}
              </span>
              <span className="flex items-center gap-1 text-xs text-warm-500">
                <Users size={12} />
                {event.participant_count}/{event.max_players}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {event.location && (
            <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-800 px-3 py-1.5 rounded-full font-medium">
              <MapPin size={12} />
              {event.location}
            </span>
          )}
          {event.captain_name && (
            <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-medium">
              <Crown size={12} />
              Captain: {event.captain_name}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-xs text-warm-700 mt-3 leading-relaxed">{event.description}</p>
        )}
      </div>

      {/* Join / Leave button */}
      {!isParticipant ? (
        <button
          onClick={handleJoin}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer border-none transition-colors mb-4"
        >
          <UserPlus size={16} />
          Join this event
        </button>
      ) : (
        <button
          onClick={handleLeave}
          className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-red-100 transition-colors mb-4"
        >
          <LogOut size={14} />
          Leave event
        </button>
      )}

      {/* Players strip */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-3">Players</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {event.participants.map((p) => {
            const initials = (p.name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={p.id} className="flex flex-col items-center min-w-[56px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                    p.is_captain ? 'bg-amber-400 text-warm-900' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {initials}
                </div>
                <span className="text-[10px] text-warm-500 text-center">{(p.name || 'User').split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Polls */}
      {polls.map((poll) => (
        <div key={poll.id} className="bg-white rounded-2xl border border-warm-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-warm-700" />
            <h3 className="text-sm font-semibold">{poll.question}</h3>
          </div>
          {poll.options.map((opt) => {
            const voted = poll.user_vote === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleVote(poll.id, opt.id)}
                className={`w-full relative p-3.5 border-[1.5px] rounded-xl mb-2 cursor-pointer overflow-hidden text-left transition-colors ${
                  voted ? 'border-green-500' : 'border-warm-200 hover:border-warm-500'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ${
                    voted ? 'bg-green-50' : 'bg-warm-50'
                  }`}
                  style={{ width: `${opt.percentage}%` }}
                />
                <div className="relative flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-warm-900">{opt.text}</p>
                    {opt.extra && (
                      <p className="text-xs text-warm-500 mt-0.5">{opt.extra}</p>
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${voted ? 'text-green-700' : 'text-warm-500'}`}>
                    {opt.percentage}%
                  </span>
                </div>
              </button>
            );
          })}
          <p className="text-[10px] text-warm-500 text-right">{poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}</p>
        </div>
      ))}

      {/* Chat (only for participants) */}
      {isParticipant && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Send size={14} className="text-warm-700" />
            <h3 className="text-sm font-semibold">Group chat</h3>
          </div>
          <div className="flex flex-col gap-2.5 mb-3 max-h-80 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-xs text-warm-500 text-center py-4">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold">
                      {msg.sender_id === user?.id ? 'You' : msg.sender_name}
                    </span>
                    {msg.is_captain && (
                      <span className="flex items-center gap-0.5 text-[9px] bg-amber-400 text-warm-900 px-1.5 py-0.5 rounded-full font-semibold">
                        <Crown size={8} />
                        Captain
                      </span>
                    )}
                    <span className="text-[10px] text-warm-500">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed px-3.5 py-2.5 rounded-xl ${
                      msg.sender_id === user?.id ? 'bg-green-50' : 'bg-warm-50'
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
              placeholder="Type a message..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-4 py-3 border border-warm-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
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
