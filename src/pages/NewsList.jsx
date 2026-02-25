import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CAT_COLORS = {
  product: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  security: 'bg-red-500/10 text-red-400 border-red-500/30',
  release: 'bg-primary/10 text-primary border-primary/30',
  general: 'bg-gray-700/50 text-gray-400 border-gray-600',
};

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`${API}/api/news`).then(r => { setNews(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? news : news.filter(n => n.category === filter);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-12">
          <div className="text-xs font-mono text-primary mb-3 tracking-widest">UPDATES</div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Product Updates</h1>
          <p className="text-gray-400 text-lg">Latest news, releases, and announcements from Visrodeck.</p>
        </div>
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'product', 'security', 'release', 'general'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition ${filter === cat ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
              {cat}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No updates yet.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(item => (
              <div key={item.id} className="bg-gray-900 border border-white/5 rounded-2xl p-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="text-xs font-mono text-gray-500 mb-2">
                      {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">{item.title}</h2>
                  </div>
                  <span className={`text-xs font-mono px-3 py-1 rounded-full border flex-shrink-0 ${CAT_COLORS[item.category] || CAT_COLORS.general}`}>
                    {item.category?.toUpperCase()}
                  </span>
                </div>
                {item.excerpt && <p className="text-gray-400">{item.excerpt}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
