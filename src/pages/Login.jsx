import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Welcome<br/><span className="text-primary">Back</span></h1>
          <p className="text-gray-300 text-lg leading-relaxed">Secure communication starts here. Login to access your encrypted workspace.</p>
        </div>
        <Link to="/" className="text-gray-400 hover:text-white transition text-sm relative z-10">Back to website</Link>
      </div>

      <div className="bg-gray-950 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2">Login</h2>
          <p className="text-gray-400 mb-8">Enter your credentials to continue.</p>
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Username or Email</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3.5 focus:border-primary focus:outline-none text-white"
                required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-3.5 rounded-xl transition disabled:opacity-50 font-mono mt-2">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-center mt-6 text-gray-400 text-sm">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
