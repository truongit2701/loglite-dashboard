import {
  Database,
  Globe,
  Layers,
  Layout,
  Settings,
  Terminal,
  Trash2,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api'; // Dùng api instance thay vì axios

interface CatalogItem {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

interface AllProject {
  _id: string;
  name: string;
  platformType: string;
  databaseType: string;
  apiKey: string;
  owner: { name: string; email: string }; // Sửa userId thành owner cho đúng model
  createdAt: string;
}

export default function AdminConfig() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'projects' | 'settings'>('catalog');
  const [platforms, setPlatforms] = useState<CatalogItem[]>([]);
  const [databases, setDatabases] = useState<CatalogItem[]>([]);
  const [allProjects, setAllProjects] = useState<AllProject[]>([]);
  const [ingestUrl, setIngestUrl] = useState('http://localhost:3001');
  
  const [newItem, setNewItem] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'catalog') {
        const [p, d] = await Promise.all([
          api.get('/admin/platforms'),
          api.get('/admin/databases')
        ]);
        setPlatforms(p.data);
        setDatabases(d.data);
      } else if (activeTab === 'projects') {
        const res = await api.get('/admin/projects');
        setAllProjects(res.data);
      } else if (activeTab === 'settings') {
        const res = await api.get('/admin/settings/ingest-url');
        setIngestUrl(res.data.value);
      }
    } catch (err) {
      console.error('Admin fetch error', err);
    } 
  };

  const handleSaveSettings = async () => {
    try {
      await api.post('/admin/settings/ingest-url', { value: ingestUrl });
      alert('System settings updated!');
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  const addCatalogItem = async (type: 'platform' | 'database') => {
    const endpoint = type === 'platform' ? 'platforms' : 'databases';
    try {
      await api.post(`/admin/${endpoint}`, newItem);
      setNewItem({ name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add item');
    }
  };

  const deleteCatalogItem = async (type: 'platform' | 'database', id: string) => {
    const endpoint = type === 'platform' ? 'platforms' : 'databases';
    try {
      await api.delete(`/admin/${endpoint}/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 dark:bg-white p-3 text-white dark:text-zinc-900">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Control Center</h1>
              <p className="text-zinc-500 font-medium text-sm">Manage system-wide configurations and project ecosystems.</p>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-zinc-200/50 dark:bg-zinc-900 p-1 w-fit mb-8">
          {[
            { id: 'catalog', icon: Layers, label: 'Tech Catalog' },
            { id: 'projects', icon: Users, label: 'All Projects' },
            { id: 'settings', icon: Globe, label: 'System Settings' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'catalog' && (
          <div className="grid grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Platform Management */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                  <Layout size={20} className="text-blue-500" /> Platform Types
                </h2>
              </div>
              <div className="space-y-3">
                {platforms.map(item => (
                  <div key={item._id} className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group">
                    <div>
                      <div className="font-black text-sm">{item.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{item.code}</div>
                    </div>
                    <button onClick={() => deleteCatalogItem('platform', item._id)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 border border-dashed border-zinc-300 dark:border-zinc-700">
                   <input 
                    placeholder="New Platform Name" 
                    className="w-full bg-transparent outline-none text-sm font-bold mb-2"
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                   />
                   <div className="flex gap-2">
                     <input 
                      placeholder="Code (e.g. nodejs)" 
                      className="flex-1 bg-transparent outline-none text-[10px] font-mono"
                      value={newItem.code}
                      onChange={e => setNewItem({...newItem, code: e.target.value.toLowerCase()})}
                     />
                     <button onClick={() => addCatalogItem('platform')} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1 text-[10px] font-black uppercase">Add</button>
                   </div>
                </div>
              </div>
            </section>

            {/* Database Management */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                  <Database size={20} className="text-purple-500" /> Database Types
                </h2>
              </div>
              <div className="space-y-3">
                {databases.map(item => (
                  <div key={item._id} className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group">
                    <div>
                      <div className="font-black text-sm">{item.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{item.code}</div>
                    </div>
                    <button onClick={() => deleteCatalogItem('database', item._id)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 border border-dashed border-zinc-300 dark:border-zinc-700">
                   <input 
                    placeholder="New Database Name" 
                    className="w-full bg-transparent outline-none text-sm font-bold mb-2"
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                   />
                   <div className="flex gap-2">
                     <input 
                      placeholder="Code (e.g. mongodb)" 
                      className="flex-1 bg-transparent outline-none text-[10px] font-mono"
                      value={newItem.code}
                      onChange={e => setNewItem({...newItem, code: e.target.value.toLowerCase()})}
                     />
                     <button onClick={() => addCatalogItem('database')} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1 text-[10px] font-black uppercase">Add</button>
                   </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Project Name</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Owner</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Tech Stack</th>
                    <th className="px-6 py-4 text-[10px] uppercase font-black text-zinc-400">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {allProjects.map(project => (
                    <tr key={project._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-sm">{project.name}</div>
                        <div className="text-[10px] font-mono text-zinc-400">{project.apiKey}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{project.owner?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-zinc-500">{project.owner?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase border border-blue-200 dark:border-blue-800">{project.platformType}</span>
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[9px] font-black uppercase border border-purple-200 dark:border-purple-800">{project.databaseType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono text-zinc-400">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6">Global Ingest Configuration</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-black text-zinc-400 mb-2 block">System Ingest URL</label>
                  <div className="flex gap-4">
                    <input 
                      className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 text-sm font-mono outline-none focus:border-blue-500 transition-colors"
                      value={ingestUrl}
                      onChange={e => setIngestUrl(e.target.value)}
                      placeholder="http://your-server-domain:3001"
                    />
                    <button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-xs font-black uppercase tracking-widest transition-all">
                      Save Settings
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] text-zinc-500 italic">This URL will be provided to all users when they create a project or view their SDK setup instructions.</p>
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                   <div className="flex items-center gap-3 text-amber-500">
                     <Terminal size={18} />
                     <span className="text-xs font-bold uppercase tracking-wide">Danger Zone</span>
                   </div>
                   <p className="text-[11px] text-zinc-500 mt-2">Changing the global Ingest URL will affect documentation and setup guides. Existing SDK integrations using a different URL will continue to work but should be updated.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
