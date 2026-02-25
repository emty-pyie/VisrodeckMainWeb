import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/blogs`).then(r => { setBlogs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-12">
          <div className="text-xs font-mono text-primary mb-3 tracking-widest">BLOG</div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Insights & Thoughts</h1>
          <p className="text-gray-400 text-lg">Privacy, security, and technology from the Visrodeck team.</p>
        </div>
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No posts yet. Check back soon.</div>
        ) : (
          <div className="space-y-6">
            {blogs.map(blog => (
              <Link key={blog.id} to={`/blog/${blog.slug}`}
                className="block bg-gray-900 border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition group">
                <div className="text-xs font-mono text-gray-500 mb-3">
                  {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  &nbsp;·&nbsp;@{blog.author_username}
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition tracking-tight">{blog.title}</h2>
                {blog.excerpt && <p className="text-gray-400 mb-4">{blog.excerpt}</p>}
                <span className="text-sm font-mono text-primary">Read more →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
