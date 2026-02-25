import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getToken = () => localStorage.getItem('token');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Admin() {
  const [tab, setTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', category: 'general', published: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [b, n] = await Promise.all([
        axios.get(`${API}/api/blogs/all`, { headers }),
        axios.get(`${API}/api/news/all`, { headers }),
      ]);
      setBlogs(b.data);
      setNews(n.data);
    } catch (e) { console.error(e); }
  };

  const save = async () => {
    if (!form.title || !form.slug || !form.content) { setMsg('Title, slug and content are required'); return; }
    setLoading(true); setMsg('');
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const endpoint = tab === 'blogs' ? '/api/blogs' : '/api/news';
      if (editing) {
        await axios.put(`${API}${endpoint}/${editing}`, form, { headers });
        setMsg('Updated successfully');
      } else {
        await axios.post(`${API}${endpoint}`, form, { headers });
        setMsg('Published successfully');
      }
      cancelEdit();
      fetchAll();
    } catch (e) { setMsg(e.response?.data?.error || 'Save failed'); }
    setLoading(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this post?')) return;
    const headers = { Authorization: `Bearer ${getToken()}` };
    const endpoint = tab === 'blogs' ? `/api/blogs/${id}` : `/api/news/${id}`;
    await axios.delete(`${API}${endpoint}`, { headers });
    fetchAll();
  };

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({ title: item.title, slug: item.slug, content: item.content, excerpt: item.excerpt || '', category: item.category || 'general', published: !!item.published });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ title: '', slug: '', content: '', excerpt: '', category: 'general', published: false });
    setMsg('');
  };

  const items = tab === 'blogs' ? blogs : news;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-10">
          <div className="text-xs font-mono text-primary mb-2 tracking-widest">ADMIN PANEL</div>
          <h1 className="text-4xl font-bold tracking-tight">Content Manager</h1>
        </div>

        <div className="flex gap-0 mb-8 border-b border-white/10">
          {['blogs', 'news'].map(t => (
            <button key={t} onClick={() => { setTab(t); cancelEdit(); }}
              className={`px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider border-b-2 -mb-px transition ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
              {t === 'blogs' ? 'Blog Posts' : 'News & Updates'}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">{editing ? 'Edit Post' : `New ${tab === 'blogs' ? 'Blog Post' : 'Update'}`}</h2>
          {msg && (
            <div className={`p-4 rounded-xl mb-6 text-sm border ${msg.includes('success') ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {msg}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white"
                placeholder="Post title..." />
            </div>
            <div className={`grid gap-4 ${tab === 'news' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white font-mono text-sm"
                  placeholder="post-url-slug" />
              </div>
              {tab === 'news' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white">
                    <option value="general">General</option>
                    <option value="product">Product Update</option>
                    <option value="security">Security</option>
                    <option value="release">New Release</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Excerpt</label>
              <input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white"
                placeholder="Short description shown in listings..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Content</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={12} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 focus:border-primary focus:outline-none text-white font-mono text-sm resize-y"
                placeholder="Write your content here..." />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.published ? 'bg-primary' : 'bg-gray-700'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm text-gray-300">{form.published ? 'Published' : 'Draft'}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={loading}
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-black font-bold rounded-xl transition disabled:opacity-50 font-mono">
                {loading ? 'Saving...' : editing ? 'Update Post' : 'Publish Post'}
              </button>
              {editing && (
                <button onClick={cancelEdit} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">All {tab === 'blogs' ? 'Blog Posts' : 'Updates'} ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No posts yet. Create your first one above.</p>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ${item.published ? 'bg-primary/10 text-primary border-primary/30' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                        {item.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                      {tab === 'news' && item.category && (
                        <span className="text-xs font-mono text-gray-500">#{item.category}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">/{tab}/{item.slug}</div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button onClick={() => startEdit(item)} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition">Edit</button>
                    <button onClick={() => del(item.id)} className="px-4 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}