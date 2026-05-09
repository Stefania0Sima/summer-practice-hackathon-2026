import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Crown, MapPin, DollarSign, Send, BarChart3, Clock, Users } from 'lucide-react';
import { SportIcon } from '../components/SportIcons';

// Mock data
const MOCK_PLAYERS = [
  { name: 'Mihai P.', initials: 'MP', isCaptain: true },
  { name: 'Alex M.', initials: 'AM', isCaptain: false },
  { name: 'Dana R.', initials: 'DR', isCaptain: false },
  { name: 'Elena S.', initials: 'ES', isCaptain: false },
  { name: 'Radu C.', initials: 'RC', isCaptain: false },
  { name: 'Ioana B.', initials: 'IB', isCaptain: false },
  { name: 'Vlad T.', initials: 'VT', isCaptain: false },
  { name: 'Sofia L.', initials: 'SL', isCaptain: false },
];

const MOCK_VENUES = [
  { id: 'v1', name: 'Arena Sport Cluj', address: 'Str. Fabricii 12', price: '120 RON/h', votes: 5 },
  { id: 'v2', name: 'Terenul Verde', address: 'Calea Mănăștur 78', price: '80 RON/h', votes: 2 },
  { id: 'v3', name: 'SportPark Central', address: 'Bd. 21 Decembrie 45', price: '150 RON/h', votes: 1 },
];

const INITIAL_MESSAGES = [
  { id: 1, sender: 'Mihai P.', text: "Hey team! I'm the captain. Let's figure out where to play", time: '14:02', isCaptain: true },
  { id: 2, sender: 'Elena S.', text: 'Arena Sport Cluj is my go-to, they have great turf', time: '14:05', isCaptain: false },
  { id: 3, sender: 'Radu C.', text: 'Works for me! What time are we thinking?', time: '14:08', isCaptain: false },
  { id: 4, sender: 'Dana R.', text: '6 PM would be perfect, after work', time: '14:10', isCaptain: false },
];

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [msgInput, setMsgInput] = useState('');
  const [userVote, setUserVote] = useState(null);

  const totalVotes = MOCK_VENUES.reduce((sum, v) => sum + v.votes, 0) + (userVote !== null ? 1 : 0);

  function sendMessage() {
    if (!msgInput.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'You',
      text: msgInput,
      time: 'now',
      isCaptain: false,
    }]);
    setMsgInput('');
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
            <SportIcon sportId="football" size={26} className="text-green-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-warm-900">Football @ Arena Sport</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-warm-500">
                <Clock size={12} />
                Today, 18:00
              </span>
              <span className="flex items-center gap-1 text-xs text-warm-500">
                <Users size={12} />
                8/10 confirmed
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-800 px-3 py-1.5 rounded-full font-medium">
            <MapPin size={12} />
            Str. Fabricii 12
          </span>
          <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-800 px-3 py-1.5 rounded-full font-medium">
            <DollarSign size={12} />
            120 RON/h
          </span>
          <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-medium">
            <Crown size={12} />
            Captain: Mihai P.
          </span>
        </div>
      </div>

      {/* Players strip */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-3">Players</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MOCK_PLAYERS.map((p, i) => (
            <div key={i} className="flex flex-col items-center min-w-[56px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                  p.isCaptain ? 'bg-amber-400 text-warm-900' : 'bg-green-100 text-green-800'
                }`}
              >
                {p.initials}
              </div>
              <span className="text-[10px] text-warm-500 text-center">{p.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Poll / Vote on venue */}
      <div className="bg-white rounded-2xl border border-warm-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-warm-700" />
          <h3 className="text-sm font-semibold">Vote on venue</h3>
        </div>
        {MOCK_VENUES.map((venue) => {
          const voted = userVote === venue.id;
          const thisVotes = venue.votes + (voted ? 1 : 0);
          const pct = totalVotes > 0 ? Math.round((thisVotes / totalVotes) * 100) : 0;
          return (
            <button
              key={venue.id}
              onClick={() => setUserVote(venue.id)}
              className={`w-full relative p-3.5 border-[1.5px] rounded-xl mb-2 cursor-pointer overflow-hidden text-left transition-colors ${
                voted ? 'border-green-500' : 'border-warm-200 hover:border-warm-500'
              }`}
            >
              {/* Progress bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ${
                  voted ? 'bg-green-50' : 'bg-warm-50'
                }`}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-warm-900">{venue.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-warm-500">
                      <MapPin size={10} />
                      {venue.address}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-warm-500">
                      <DollarSign size={10} />
                      {venue.price}
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${voted ? 'text-green-700' : 'text-warm-500'}`}>
                  {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Send size={14} className="text-warm-700" />
          <h3 className="text-sm font-semibold">Group chat</h3>
        </div>
        <div className="flex flex-col gap-2.5 mb-3">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold">{msg.sender}</span>
                {msg.isCaptain && (
                  <span className="flex items-center gap-0.5 text-[9px] bg-amber-400 text-warm-900 px-1.5 py-0.5 rounded-full font-semibold">
                    <Crown size={8} />
                    Captain
                  </span>
                )}
                <span className="text-[10px] text-warm-500">{msg.time}</span>
              </div>
              <p
                className={`text-sm leading-relaxed px-3.5 py-2.5 rounded-xl ${
                  msg.sender === 'You' ? 'bg-green-50' : 'bg-warm-50'
                }`}
              >
                {msg.text}
              </p>
            </div>
          ))}
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
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl cursor-pointer border-none transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
