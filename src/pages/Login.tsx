import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Terminal, Lock, User as UserIcon } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 mb-8 text-zinc-900 dark:text-white font-bold text-xl">
          <Terminal size={24} className="text-zinc-600 dark:text-zinc-400" />
          <span>LogLite</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">Username</label>
            <div className="relative">
              <UserIcon size={16} className="absolute left-3 top-3.5 text-zinc-400" />
              <input 
                type="text" 
                className="w-full p-2.5 pl-10 border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors font-medium text-sm"
                placeholder="Enter username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3.5 text-zinc-400" />
              <input 
                type="password" 
                className="w-full p-2.5 pl-10 border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors font-medium text-sm"
                placeholder="Enter password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest py-1">{error}</p>}

          <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 p-3 font-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors mt-4 uppercase tracking-[0.2em] text-[10px]">
            Sign In
          </button>
        </form>
        
        <p className="mt-8 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          No account? <Link to="/register" className="text-zinc-900 dark:text-zinc-100 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
