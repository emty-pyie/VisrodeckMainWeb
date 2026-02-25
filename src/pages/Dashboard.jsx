import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    setUser(JSON.parse(stored));
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-12">
          <div className="text-xs font-mono text-primary mb-2 tracking-widest">DASHBOARD</div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Welcome back, <span className="text-primary">@{user.username}</span></h1>
          <p className="text-gray-400">Your secure workspace.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Status', value: 'Active', color: 'text-primary' },
            { label: 'Account Type', value: user.isAdmin ? 'Admin' : 'Member', color: 'text-white' },
            { label: 'Username', value: `@${user.username}`, color: 'text-white font-mono' },
            { label: 'Encryption', value: 'AES-256', color: 'text-primary font-mono' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-white/5 rounded-xl p-5">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{s.label}</div>
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-6">Products</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { name: 'Visrodeck Relay', desc: 'Encrypted anonymous messaging.', status: 'live', href: 'https://relay.visrodeck.com', external: true },
            { name: 'Community Chat', desc: 'Private encrypted chat rooms.', status: 'live', href: '/chat', external: false },
            { name: 'Jane Assistant', desc: 'Privacy-first AI assistant.', status: 'soon', href: '#', external: false },
          ].map(p => (
            <div key={p.name} className="bg-gray-900 border border-white/5 rounded-xl p-6 hover:border-primary/30 transition">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${p.status === 'live' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                  {p.status === 'live' ? 'LIVE' : 'SOON'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-5">{p.desc}</p>
              {p.status === 'live' ? (
                p.external ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-primary hover:underline">Launch →</a>
                ) : (
                  <Link to={p.href} className="text-sm font-mono text-primary hover:underline">Launch →</Link>
                )
              ) : (
                <span className="text-sm font-mono text-gray-500">Coming Soon</span>
              )}
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-6">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Blog', href: '/blog', external: false },
            { label: 'Updates', href: '/news', external: false },
            { label: 'Community Chat', href: '/chat', external: false },
            { label: 'Relay App', href: 'https://relay.visrodeck.com', external: true },
          ].map(item => (
            item.external ? (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                className="bg-gray-900 border border-white/5 rounded-xl p-4 flex items-center justify-center text-sm font-medium hover:border-white/20 transition">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.href}
                className="bg-gray-900 border border-white/5 rounded-xl p-4 flex items-center justify-center text-sm font-medium hover:border-white/20 transition">
                {item.label}
              </Link>
            )
          ))}
        </div>

        {user.isAdmin && (
          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <h2 className="text-lg font-bold mb-2">Admin Access</h2>
            <p className="text-gray-400 text-sm mb-4">You have admin privileges. Manage content from the admin panel.</p>
            <Link to="/admin" className="px-6 py-2 bg-primary text-black font-bold rounded-lg text-sm font-mono hover:bg-primary-dark transition inline-block">
              Go to Admin Panel
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}