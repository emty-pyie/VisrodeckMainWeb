import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-lg border-b border-white/5 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="font-mono text-xl font-bold tracking-tight">VISRODECK</Link>
        <div className="flex items-center gap-6">
          <Link to="/blog" className={`text-sm transition ${isActive('/blog') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Blog</Link>
          <Link to="/news" className={`text-sm transition ${isActive('/news') ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Updates</Link>
          <Link to="/labs" className={`text-sm transition font-medium ${isActive('/labs') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
            Labs
          </Link>
          {token && user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className={`text-sm transition ${isActive('/dashboard') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>Dashboard</Link>
              {user.isAdmin && (
                <Link to="/admin" className="text-sm text-primary hover:text-primary-dark transition">Admin</Link>
              )}
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <span className="text-sm font-mono text-gray-300">@{user.username}</span>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition">Logout</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-gray-300 hover:text-white transition">Login</Link>
              <Link to="/signup" className="px-4 py-2 bg-primary text-black text-sm font-bold rounded-lg hover:bg-primary-dark transition font-mono">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}