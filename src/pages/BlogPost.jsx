import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/blogs/${slug}`).then(r => { setBlog(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-black text-white"><Navbar /><div className="text-center pt-40 text-gray-500">Loading...</div></div>;
  if (!blog) return <div className="min-h-screen bg-black text-white"><Navbar /><div className="text-center pt-40"><p className="text-gray-400 mb-4">Post not found.</p><Link to="/blog" className="text-primary hover:underline">Back to Blog</Link></div></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <Link to="/blog" className="text-sm font-mono text-gray-400 hover:text-white transition mb-8 inline-block">← Back to Blog</Link>
        <div className="text-xs font-mono text-gray-500 mb-4">
          {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · @{blog.author_username}
        </div>
        <h1 className="text-4xl font-bold mb-6 tracking-tight">{blog.title}</h1>
        {blog.excerpt && <p className="text-xl text-gray-300 mb-8 border-l-2 border-primary pl-5">{blog.excerpt}</p>}
        <div className="space-y-4">
          {blog.content.split('\n').map((para, i) =>
            para.trim() ? <p key={i} className="text-gray-300 leading-relaxed">{para}</p> : <div key={i} className="h-2" />
          )}
        </div>
      </div>
    </div>
  );
}
