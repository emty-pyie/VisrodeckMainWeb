import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (form.username.length < 3) { setUsernameStatus(null); return; }
    const t = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await axios.get(`${API}/api/auth/check-username/${form.username}`);
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch { setUsernameStatus(null); }
      setChecking(false);
    }, 500);
    return () => clearTimeout(t);
  }, [form.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/register`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative bg-black flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        <Link to="/" className="font-mono text-xl font-bold relative z-10">VISRODECK</Link>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Create Your<br/><span className="text-primary">Account</span></h1>
          <p className="text-gray-300 text-lg leading-relaxed">Join the privacy revolution. Your secure workspace awaits.</p>
        </div>
        <Link to="/" className="text-gray-400 hover:text-white transition text-sm relative z-10">Back to website</Link>
      </div>

      <div className="bg-gray-950 flex items-center justify-center p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2">Sign up</h2>
          <p className="text-gray-400 mb-8">Create your free account.</p>
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white font-mono"
                required />
              {form.username.length >= 3 && (
                <p className={`text-xs mt-2 ${checking ? 'text-gray-400' : usernameStatus === 'available' ? 'text-primary' : 'text-red-400'}`}>
                  {checking ? 'Checking...' : usernameStatus === 'available' ? '✓ Username available' : '✗ Username taken'}
                </p>
              )}
              <p className="text-xs text-gray-600 mt-1">3-20 characters. Letters, numbers, underscore only.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white"
                required minLength={6} />
              <p className="text-xs text-gray-600 mt-1">Minimum 6 characters</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">First Name</label>
                <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Last Name</label>
                <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white" />
              </div>
            </div>
            <button type="submit" disabled={loading || usernameStatus !== 'available'}
              className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-3.5 rounded-xl transition disabled:opacity-50 font-mono mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}