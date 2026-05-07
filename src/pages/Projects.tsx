import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Copy,
  Database,
  ExternalLink,
  Layout,
  LogOut,
  Shield,
  Terminal
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import api from '../services/api'; // Dùng api instance thay vì axios

interface Project {
  _id: string;
  name: string;
  platformType: string;
  databaseType: string;
  apiKey: string;
  ingestUrl: string;
  createdAt: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [systemIngestUrl, setSystemIngestUrl] = useState('http://localhost:3001');

  // Admin Check
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  // Form State
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [databases, setDatabases] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    platformType: '',
    databaseType: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchCatalogs();
    fetchSystemConfig();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchSystemConfig = async () => {
    try {
      const res = await api.get('/system-config/public');
      setSystemIngestUrl(res.data.ingestUrl);
    } catch (err) {
      console.error('Failed to fetch system config');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogs = async () => {
    try {
      const [p, d] = await Promise.all([
        api.get('/admin/platforms'),
        api.get('/admin/databases')
      ]);
      setPlatforms(p.data);
      setDatabases(d.data);
      if (p.data.length > 0) setFormData(prev => ({ ...prev, platformType: p.data[0].code }));
      if (d.data.length > 0) setFormData(prev => ({ ...prev, databaseType: d.data[0].code }));
    } catch (err) {
       console.error('Failed to fetch catalogs', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', formData);
      setCreatedProject(res.data);
      setShowCreateModal(false);
      setShowSuccessModal(true);
      fetchProjects();
    } catch (err) {
      alert('Failed to create project');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors font-sans">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 dark:bg-white p-3 text-white dark:text-zinc-900">
              <Terminal size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">LogLite Console</h1>
              <p className="text-zinc-500 font-medium text-sm">Professional observability for your modern ecosystem.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             {isAdmin && (
               <button 
                onClick={() => navigate('/admin/config')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
              >
                <Shield size={14} /> System Admin
              </button>
             )}
             <ThemeToggle />
             <button 
              onClick={handleLogout}
              className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-500 transition-colors border border-zinc-200 dark:border-zinc-700"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
             <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl dark:shadow-white/5"
            >
              New Project
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-zinc-200 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {projects.map(project => (
              <div 
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}/logs`)}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 cursor-pointer hover:border-zinc-900 dark:hover:border-zinc-100 transition-all hover:shadow-2xl dark:hover:shadow-white/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase border border-zinc-200 dark:border-zinc-700">{project.platformType}</span>
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase border border-zinc-200 dark:border-zinc-700">{project.databaseType}</span>
                  </div>
                  <ExternalLink size={16} className="text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:italic transition-all">{project.name}</h3>
                
                <div className="space-y-1 mb-6">
                  <div className="flex items-center justify-between group/key p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <p className="text-[10px] font-mono text-zinc-400 truncate pr-4">KEY: {project.apiKey}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(project.apiKey);
                        alert('API Key Copied!');
                      }}
                      className="text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 opacity-0 group-hover/key:opacity-100 transition-all"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between group/url p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <p className="text-[10px] font-mono text-zinc-400 truncate pr-4">URL: {project.ingestUrl}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(project.ingestUrl);
                        alert('Ingest URL Copied!');
                      }}
                      className="text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 opacity-0 group-hover/url:opacity-100 transition-all"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live Status</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-xl p-12 shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Build New Project</h2>
              <form onSubmit={handleCreate} className="space-y-8">
                <div>
                  <label className="text-[10px] uppercase font-black text-zinc-400 mb-2 block">Project Identity</label>
                  <input 
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 text-sm font-bold outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                    placeholder="e.g. Inventory Management API"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] uppercase font-black text-zinc-400 mb-2 block flex items-center gap-2">
                      <Layout size={12} /> Platform Type
                    </label>
                    <select 
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 text-xs font-bold outline-none"
                      value={formData.platformType}
                      onChange={e => setFormData({...formData, platformType: e.target.value})}
                    >
                      {platforms.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-zinc-400 mb-2 block flex items-center gap-2">
                      <Database size={12} /> Database Metadata
                    </label>
                    <select 
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 text-xs font-bold outline-none"
                      value={formData.databaseType}
                      onChange={e => setFormData({...formData, databaseType: e.target.value})}
                    >
                      {databases.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 text-xs font-black uppercase tracking-widest">Initialize Infrastructure</button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-8 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && createdProject && (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl p-12 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4 mb-8 text-green-500">
                <CheckCircle size={40} />
                <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Deployment Successful</h2>
              </div>
              
              <div className="space-y-6 mb-12">
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 border border-zinc-200 dark:border-zinc-700">
                  <div className="text-[10px] uppercase font-black text-zinc-400 mb-1">Ingest URL (Global)</div>
                  <div className="flex items-center justify-between">
                    <code className="text-blue-500 font-mono text-sm font-bold truncate pr-4">{createdProject.ingestUrl || systemIngestUrl}</code>
                    <button onClick={() => {
                      navigator.clipboard.writeText(createdProject.ingestUrl || systemIngestUrl);
                      alert('Copied Ingest URL');
                    }} className="text-[10px] font-black underline hover:text-zinc-900 dark:hover:text-zinc-100">Copy</button>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 border border-zinc-200 dark:border-zinc-700">
                  <div className="text-[10px] uppercase font-black text-zinc-400 mb-1">Project API Key</div>
                  <div className="flex items-center justify-between">
                    <code className="text-zinc-900 dark:text-zinc-100 font-mono text-sm font-bold truncate pr-4">{createdProject.apiKey}</code>
                    <button onClick={() => {
                      navigator.clipboard.writeText(createdProject.apiKey);
                      alert('Copied API Key');
                    }} className="text-[10px] font-black underline hover:text-zinc-900 dark:hover:text-zinc-100">Copy</button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 mb-8 flex gap-4">
                 <AlertCircle size={24} className="text-amber-500 shrink-0" />
                 <div>
                   <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Security Notice</p>
                   <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Keep your API Key secret. Use environment variables (e.g., <code className="bg-zinc-200 dark:bg-zinc-800 px-1">LOGLITE_API_KEY</code>) to integrate with the SDK securely.</p>
                 </div>
              </div>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 text-xs font-black uppercase tracking-widest"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
