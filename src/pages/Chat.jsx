import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

const ROOMS = [
  { id: 'general', name: 'general', desc: 'General discussion' },
  { id: 'announcements', name: 'announcements', desc: 'Official announcements' },
  { id: 'relay-support', name: 'relay-support', desc: 'Help with Visrodeck Relay' },
  { id: 'privacy', name: 'privacy', desc: 'Privacy & security talk' },
  { id: 'off-topic', name: 'off-topic', desc: 'Everything else' },
];

export default function Chat() {
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !user) { navigate('/login'); return; }
    connect();
    return () => wsRef.current?.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, room]);

  const connect = () => {
    try {
      const socket = new WebSocket(`${WS_URL}?token=${token}`);
      socket.onopen = () => {
        setConnected(true);
        socket.send(JSON.stringify({ type: 'join', room: 'general' }));
      };
      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'message') {
          setMessages(prev => ({
            ...prev,
            [data.room]: [...(prev[data.room] || []), { ...data, id: Date.now() + Math.random(), isOwn: data.username === user.username }]
          }));
        }
        if (data.type === 'history') {
          setMessages(prev => ({
            ...prev,
            [data.room]: data.messages.map(m => ({ ...m, isOwn: m.username === user.username }))
          }));
        }
        if (data.type === 'online_count') setOnlineCount(data.count);
      };
      socket.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
      socket.onerror = () => setConnected(false);
      wsRef.current = socket;
      setWs(socket);
    } catch (e) { console.error('WS failed:', e); }
  };

  const switchRoom = (newRoom) => {
    setRoom(newRoom);
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'join', room: newRoom }));
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || wsRef.current?.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ type: 'message', room, text: input.trim(), timestamp: new Date().toISOString() }));
    setInput('');
  };

  const roomMessages = messages[room] || [];
  const currentRoom = ROOMS.find(r => r.id === room);

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: '65px' }}>
        <div className="w-60 bg-gray-950 border-r border-white/5 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/5">
            <div className="text-xs font-mono text-primary uppercase tracking-widest mb-1">Community</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-primary' : 'bg-gray-600'}`} />
              {connected ? `${onlineCount} online` : 'Connecting...'}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs font-mono text-gray-600 uppercase tracking-wider px-3 py-2">Channels</div>
            {ROOMS.map(r => (
              <button key={r.id} onClick={() => switchRoom(r.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 transition text-sm ${room === r.id ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}>
                <span className="text-gray-600 text-xs">#</span>
                <span>{r.name}</span>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-mono font-bold text-primary">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-mono font-bold text-white">@{user?.username}</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-black flex items-center justify-between flex-shrink-0">
            <div>
              <span className="font-bold"># {currentRoom?.name}</span>
              <span className="text-gray-500 text-sm ml-3">{currentRoom?.desc}</span>
            </div>
            <div className={`flex items-center gap-2 text-xs font-mono ${connected ? 'text-primary' : 'text-gray-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-primary' : 'bg-gray-600'}`} />
              {connected ? 'Connected' : 'Reconnecting...'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-1">
            {roomMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-gray-400 font-medium">No messages yet in #{currentRoom?.name}</p>
                <p className="text-gray-600 text-sm mt-1">Be the first to say something.</p>
              </div>
            ) : (
              roomMessages.map((msg, i) => {
                const showHeader = i === 0 || roomMessages[i - 1].username !== msg.username;
                return (
                  <div key={msg.id || i} className={`flex gap-3 ${showHeader ? 'mt-5' : 'mt-0.5'}`}>
                    {showHeader ? (
                      <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-mono font-bold flex-shrink-0 mt-0.5">
                        {msg.username?.[0]?.toUpperCase()}
                      </div>
                    ) : <div className="w-9 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      {showHeader && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className={`font-bold text-sm ${msg.isOwn ? 'text-primary' : 'text-white'}`}>@{msg.username}</span>
                          <span className="text-xs text-gray-600">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <p className="text-gray-200 text-sm leading-relaxed break-words">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/5 bg-black flex-shrink-0">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder={`Message #${currentRoom?.name}`}
                className="flex-1 bg-gray-900 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-primary focus:outline-none placeholder-gray-600"
                maxLength={500} disabled={!connected} />
              <button type="submit" disabled={!input.trim() || !connected}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-black font-bold rounded-xl transition disabled:opacity-40 text-sm font-mono flex-shrink-0">
                Send
              </button>
            </form>
            <p className="text-xs text-gray-600 mt-2 px-1">Messages are encrypted. All communications are private.</p>
          </div>
        </div>
      </div>
    </div>
  );
}