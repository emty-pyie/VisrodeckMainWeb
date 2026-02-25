import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getToken = () => localStorage.getItem('token');

const POST_TYPES = [
  { id: 'article', label: 'Article', icon: '📝', desc: 'Share ideas, findings, research' },
  { id: 'code', label: 'Code', icon: '💻', desc: 'Share scripts, snippets, tools' },
  { id: 'model', label: 'Model', icon: '🧠', desc: 'AI models, architectures, weights' },
  { id: 'resource', label: 'Resource', icon: '📦', desc: 'Datasets, libraries, papers' },
  { id: 'project', label: 'Project', icon: '🚀', desc: 'Full projects and repos' },
];

const CATEGORIES = ['all', 'ai-ml', 'security', 'privacy', 'hardware', 'software', 'research', 'tools', 'other'];

const TYPE_COLORS = {
  article: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  code: 'bg-primary/10 text-primary border-primary/30',
  model: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  resource: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  project: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};

const TYPE_ICONS = { article: '📝', code: '💻', model: '🧠', resource: '📦', project: '🚀' };

export default function Labs() {
  const [view, setView] = useState('feed'); // feed | new | post | gather
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // New post form
  const [form, setForm] = useState({
    title: '', content: '', type: 'article', category: 'software',
    tags: '', codeLanguage: '', codeContent: '', resourceLinks: ''
  });
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState('');

  // Resource gatherer
  const [gatherInput, setGatherInput] = useState('');
  const [gatherResults, setGatherResults] = useState(null);
  const [gathering, setGathering] = useState(false);

  // Comment
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) { navigate('/login'); return; }
    fetchPosts();
  }, [categoryFilter, typeFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      const res = await axios.get(`${API}/api/labs/posts?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPosts(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openPost = async (post) => {
    setSelectedPost(post);
    setView('post');
    try {
      const res = await axios.get(`${API}/api/labs/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setComments(res.data);
    } catch (e) { console.error(e); }
  };

  const submitPost = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setPostMsg('Title and content are required');
      return;
    }
    setPosting(true);
    setPostMsg('');
    try {
      await axios.post(`${API}/api/labs/posts`, form, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPostMsg('Posted successfully!');
      setForm({ title: '', content: '', type: 'article', category: 'software', tags: '', codeLanguage: '', codeContent: '', resourceLinks: '' });
      setTimeout(() => { setView('feed'); fetchPosts(); setPostMsg(''); }, 1000);
    } catch (e) {
      setPostMsg(e.response?.data?.error || 'Post failed');
    }
    setPosting(false);
  };

  const upvote = async (postId, e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`${API}/api/labs/posts/${postId}/vote`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes: res.data.votes, user_voted: res.data.voted } : p));
      if (selectedPost?.id === postId) setSelectedPost(prev => ({ ...prev, votes: res.data.votes, user_voted: res.data.voted }));
    } catch (e) { console.error(e); }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const res = await axios.post(`${API}/api/labs/posts/${selectedPost.id}/comments`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setComments(prev => [...prev, res.data]);
      setCommentText('');
    } catch (e) { console.error(e); }
    setCommenting(false);
  };

  const gatherResources = async () => {
    if (!gatherInput.trim()) return;
    setGathering(true);
    setGatherResults(null);
    try {
      const res = await axios.post(`${API}/api/labs/gather-resources`,
        { description: gatherInput },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setGatherResults(res.data);
    } catch (e) { console.error(e); }
    setGathering(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono text-primary mb-2 tracking-widest">RESEARCH & INNOVATION</div>
            <h1 className="text-4xl font-bold tracking-tight">Visrodeck Labs</h1>
            <p className="text-gray-400 mt-1">Share innovations. Build together. Gather resources.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView('gather')}
              className={`px-5 py-2.5 rounded-xl text-sm font-mono font-bold border transition ${view === 'gather' ? 'bg-primary/10 border-primary text-primary' : 'border-white/10 text-gray-300 hover:border-white/30'}`}>
              Resource Gatherer
            </button>
            <button onClick={() => setView(view === 'new' ? 'feed' : 'new')}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-black rounded-xl text-sm font-mono font-bold transition">
              + New Post
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RESOURCE GATHERER VIEW */}
        {/* ============================================================ */}
        {view === 'gather' && (
          <div className="max-w-3xl">
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-8 mb-6">
              <h2 className="text-2xl font-bold mb-2 tracking-tight">Project Resource Gatherer</h2>
              <p className="text-gray-400 mb-6 text-sm">Describe your project or research goal. Labs will identify all the tools, libraries, datasets, papers, and references you need to get started.</p>
              <textarea
                value={gatherInput}
                onChange={e => setGatherInput(e.target.value)}
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 focus:border-primary focus:outline-none text-white text-sm resize-none mb-4"
                placeholder="Example: I want to build a privacy-preserving federated learning system for medical image classification. I need it to work on edge devices with limited compute..."
              />
              <button onClick={gatherResources} disabled={gathering || !gatherInput.trim()}
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-black font-bold rounded-xl font-mono transition disabled:opacity-40">
                {gathering ? 'Gathering resources...' : 'Gather Resources'}
              </button>
            </div>

            {gathering && (
              <div className="bg-gray-900 border border-white/5 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4 animate-pulse">🔍</div>
                <p className="text-gray-400">Scanning Labs for relevant resources...</p>
              </div>
            )}

            {gatherResults && (
              <div className="space-y-4">
                <div className="bg-gray-900 border border-primary/20 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-1 text-primary">Resources Found</h3>
                  <p className="text-gray-400 text-sm mb-6">{gatherResults.summary}</p>

                  {gatherResults.categories.map(cat => (
                    <div key={cat.name} className="mb-6">
                      <h4 className="font-mono font-bold text-sm uppercase tracking-widest text-gray-300 mb-3 flex items-center gap-2">
                        <span>{cat.icon}</span> {cat.name}
                      </h4>
                      <div className="space-y-2">
                        {cat.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-gray-800 rounded-xl border border-white/5">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{item.name}</span>
                                {item.tag && (
                                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{item.tag}</span>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs">{item.description}</p>
                              {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer"
                                  className="text-xs font-mono text-primary hover:underline mt-1 inline-block">
                                  {item.link} →
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {gatherResults.communityPosts && gatherResults.communityPosts.length > 0 && (
                  <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Relevant Labs Posts</h3>
                    <div className="space-y-3">
                      {gatherResults.communityPosts.map(post => (
                        <button key={post.id} onClick={() => { openPost(post); setView('post'); }}
                          className="w-full text-left p-4 bg-gray-800 rounded-xl border border-white/5 hover:border-primary/30 transition">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">{post.title}</span>
                            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${TYPE_COLORS[post.type]}`}>
                              {post.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">by @{post.author_username}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* NEW POST VIEW */}
        {/* ============================================================ */}
        {view === 'new' && (
          <div className="max-w-3xl">
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Create Post</h2>

              {postMsg && (
                <div className={`p-4 rounded-xl mb-6 text-sm border ${postMsg.includes('success') ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  {postMsg}
                </div>
              )}

              {/* Post Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-gray-300">Post Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {POST_TYPES.map(t => (
                    <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                      className={`p-3 rounded-xl border text-center transition ${form.type === t.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-gray-800 hover:border-white/20'}`}>
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className="text-xs font-mono font-bold">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white"
                    placeholder="What are you sharing?" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white">
                      <option value="ai-ml">AI / ML</option>
                      <option value="security">Security</option>
                      <option value="privacy">Privacy</option>
                      <option value="hardware">Hardware</option>
                      <option value="software">Software</option>
                      <option value="research">Research</option>
                      <option value="tools">Tools</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Tags (comma separated)</label>
                    <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white"
                      placeholder="pytorch, encryption, privacy..." />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    {form.type === 'code' ? 'Description' : form.type === 'resource' ? 'About this resource' : 'Content'}
                  </label>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 focus:border-primary focus:outline-none text-white text-sm resize-y"
                    placeholder="Share your knowledge..." />
                </div>

                {form.type === 'code' && (
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="block text-sm font-medium text-gray-300">Code</label>
                      <input value={form.codeLanguage} onChange={e => setForm(f => ({ ...f, codeLanguage: e.target.value }))}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-xs focus:border-primary focus:outline-none text-white font-mono w-32"
                        placeholder="Language (python...)" />
                    </div>
                    <textarea value={form.codeContent} onChange={e => setForm(f => ({ ...f, codeContent: e.target.value }))}
                      rows={10}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 focus:border-primary focus:outline-none text-primary font-mono text-sm resize-y"
                      placeholder="# Paste your code here..." />
                  </div>
                )}

                {(form.type === 'resource' || form.type === 'project' || form.type === 'model') && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Links & References</label>
                    <textarea value={form.resourceLinks} onChange={e => setForm(f => ({ ...f, resourceLinks: e.target.value }))}
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 focus:border-primary focus:outline-none text-white text-sm font-mono resize-none"
                      placeholder="https://github.com/...&#10;https://huggingface.co/...&#10;https://arxiv.org/..." />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={submitPost} disabled={posting}
                    className="px-8 py-3 bg-primary hover:bg-primary-dark text-black font-bold rounded-xl transition disabled:opacity-50 font-mono">
                    {posting ? 'Posting...' : 'Publish to Labs'}
                  </button>
                  <button onClick={() => setView('feed')}
                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SINGLE POST VIEW */}
        {/* ============================================================ */}
        {view === 'post' && selectedPost && (
          <div className="max-w-3xl">
            <button onClick={() => setView('feed')} className="text-sm font-mono text-gray-400 hover:text-white transition mb-6 inline-block">
              ← Back to Labs
            </button>

            <div className="bg-gray-900 border border-white/5 rounded-2xl p-8 mb-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className={`text-xs font-mono px-3 py-1 rounded-full border ${TYPE_COLORS[selectedPost.type]}`}>
                      {TYPE_ICONS[selectedPost.type]} {selectedPost.type}
                    </span>
                    <span className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 text-gray-400">
                      {selectedPost.category}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight mb-3">{selectedPost.title}</h1>
                  <div className="text-xs font-mono text-gray-500">
                    {selectedPost.author_username} · {new Date(selectedPost.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <button onClick={(e) => upvote(selectedPost.id, e)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition flex-shrink-0 ${selectedPost.user_voted ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-gray-400 hover:border-primary/50'}`}>
                  <span className="text-lg">▲</span>
                  <span className="font-mono font-bold text-sm">{selectedPost.votes || 0}</span>
                </button>
              </div>

              <div className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">{selectedPost.content}</div>

              {selectedPost.code_content && (
                <div className="mb-6">
                  <div className="flex items-center justify-between bg-gray-800 rounded-t-xl px-4 py-2 border border-gray-700">
                    <span className="font-mono text-xs text-gray-400">{selectedPost.code_language || 'code'}</span>
                  </div>
                  <pre className="bg-gray-950 rounded-b-xl p-4 overflow-x-auto border border-gray-700 border-t-0">
                    <code className="text-primary font-mono text-sm">{selectedPost.code_content}</code>
                  </pre>
                </div>
              )}

              {selectedPost.resource_links && (
                <div className="mb-6">
                  <h3 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-wider mb-3">Links & References</h3>
                  <div className="space-y-2">
                    {selectedPost.resource_links.split('\n').filter(l => l.trim()).map((link, i) => (
                      <a key={i} href={link.trim()} target="_blank" rel="noopener noreferrer"
                        className="block text-sm font-mono text-primary hover:underline bg-gray-800 px-4 py-2.5 rounded-lg border border-white/5">
                        {link.trim()} →
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedPost.tags && (
                <div className="flex gap-2 flex-wrap">
                  {selectedPost.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="text-xs font-mono px-3 py-1 rounded-full bg-gray-800 border border-white/5 text-gray-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-6">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h2>

              <div className="flex gap-3 mb-8">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-mono font-bold text-primary flex-shrink-0">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white text-sm resize-none"
                    placeholder="Share your thoughts..." />
                  <button onClick={submitComment} disabled={commenting || !commentText.trim()}
                    className="mt-2 px-6 py-2 bg-primary hover:bg-primary-dark text-black font-bold rounded-lg text-sm font-mono transition disabled:opacity-40">
                    {commenting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                      {comment.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-sm">@{comment.username}</span>
                        <span className="text-xs text-gray-600 font-mono">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FEED VIEW */}
        {/* ============================================================ */}
        {view === 'feed' && (
          <div className="flex gap-8">
            {/* Filters sidebar */}
            <div className="w-56 flex-shrink-0">
              <div className="sticky top-24">
                <div className="mb-6">
                  <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Type</div>
                  <div className="space-y-1">
                    {['all', ...POST_TYPES.map(t => t.id)].map(t => (
                      <button key={t} onClick={() => setTypeFilter(t)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${typeFilter === t ? 'bg-primary/10 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                        {t === 'all' ? 'All Types' : `${TYPE_ICONS[t]} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Category</div>
                  <div className="space-y-1">
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setCategoryFilter(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${categoryFilter === cat ? 'bg-primary/10 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="text-center py-20 text-gray-500">Loading...</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 mb-4">No posts yet. Be the first to share something!</p>
                  <button onClick={() => setView('new')} className="px-6 py-2.5 bg-primary text-black font-bold rounded-xl font-mono text-sm">
                    Create First Post
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id}
                      className="bg-gray-900 border border-white/5 rounded-2xl p-6 hover:border-primary/20 transition cursor-pointer group"
                      onClick={() => openPost(post)}>
                      <div className="flex gap-4">
                        {/* Vote */}
                        <button onClick={(e) => upvote(post.id, e)}
                          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition flex-shrink-0 ${post.user_voted ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 text-gray-500 hover:border-primary/50 hover:text-primary'}`}>
                          <span className="text-sm">▲</span>
                          <span className="font-mono font-bold text-xs">{post.votes || 0}</span>
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${TYPE_COLORS[post.type]}`}>
                              {TYPE_ICONS[post.type]} {post.type}
                            </span>
                            <span className="text-xs font-mono text-gray-500 px-2.5 py-0.5 rounded-full border border-white/5">
                              {post.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition tracking-tight">{post.title}</h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>
                          {post.tags && (
                            <div className="flex gap-2 flex-wrap mb-3">
                              {post.tags.split(',').slice(0, 4).map(tag => tag.trim()).filter(Boolean).map(tag => (
                                <span key={tag} className="text-xs font-mono text-gray-500">#{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                            <span>@{post.author_username}</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <span>{post.comment_count || 0} comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}