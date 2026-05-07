import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  Terminal
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { FilterBar } from '../components/FilterBar';
import { LogDetail } from '../components/LogDetail';
import { LogTable } from '../components/LogTable';
import ThemeToggle from '../components/ThemeToggle';
import { useLogs } from '../hooks/useLogs';
import type { LogEntry, LogFilters } from '../types';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Logs() {
  const { projectId } = useParams(); // Using projectId from URL params
  const navigate = useNavigate();

  const CACHE_KEY_FILTERS = `loglite_filters_${projectId}`;
  const CACHE_KEY_REFRESH = `loglite_refresh_${projectId}`;

  const initialFilters = useMemo(() => {
    const cached = localStorage.getItem(CACHE_KEY_FILTERS);
    const defaultFilters: LogFilters = {
      level: '', search: '', service: '', path: '', from: '', to: '', page: 1
    };
    return cached ? { ...defaultFilters, ...JSON.parse(cached), page: 1 } : defaultFilters;
  }, [CACHE_KEY_FILTERS]);

  const initialRefresh = useMemo(() => {
    const cached = localStorage.getItem(CACHE_KEY_REFRESH);
    return cached ? Number(cached) : 5000;
  }, [CACHE_KEY_REFRESH]);

  const [showFilters, setShowFilters] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(initialRefresh);
  
  const [filters, setFilters] = useState<LogFilters>(initialFilters);
  const [localFilters, setLocalFilters] = useState<LogFilters>(initialFilters);

  const debouncedSearch = useDebounce(localFilters.search, 500);
  const debouncedService = useDebounce(localFilters.service, 500);
  const debouncedPath = useDebounce(localFilters.path, 500);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearch,
      service: debouncedService,
      path: debouncedPath,
      page: 1
    }));
  }, [debouncedSearch, debouncedService, debouncedPath]);

  const updateImmediateFilter = (field: keyof LogFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    localStorage.setItem(CACHE_KEY_FILTERS, JSON.stringify(filters));
  }, [filters, CACHE_KEY_FILTERS]);

  useEffect(() => {
    localStorage.setItem(CACHE_KEY_REFRESH, String(refreshInterval));
  }, [refreshInterval, CACHE_KEY_REFRESH]);

  const { logs, pagination, stats, loading, error } = useLogs(
    projectId, 
    filters, 
    refreshInterval
  );

  const resetFilters = () => {
    const empty = { level: '', search: '', service: '', path: '', from: '', to: '', page: 1 };
    setFilters(empty);
    setLocalFilters(empty);
  };

  const handlePageChange = (newPage: number) => {
    updateImmediateFilter('page', newPage);
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors font-sans text-[13px]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2 font-bold text-xl border-b border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => navigate('/projects')}>
          <Terminal size={20} />
          <span>LogLite</span>
        </div>
        
        <div className="flex-1 p-4 flex flex-col gap-8">
          <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <ArrowLeft size={16} /> All Projects
          </button>

          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-4 block">Levels</label>
            <div className="space-y-1">
              {['', 'error', 'warn', 'info', 'debug'].map(lvl => (
                <button 
                  key={lvl}
                  onClick={() => updateImmediateFilter('level', lvl)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold transition-colors ${filters.level === lvl ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                >
                  <Activity size={16} className={lvl === 'error' ? 'text-red-500' : lvl === 'warn' ? 'text-amber-500' : ''} /> 
                  <span className="capitalize">{lvl || 'All Levels'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-4">
             <ThemeToggle />
             <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] uppercase font-bold text-zinc-400">Auto Refresh</span>
                   <select value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} className="bg-transparent text-[10px] font-black outline-none cursor-pointer">
                      <option value={3000}>3s</option>
                      <option value={5000}>5s</option>
                      <option value={10000}>10s</option>
                      <option value={0}>OFF</option>
                   </select>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">{projectId}</span>
                   <RefreshCw size={12} className={`text-blue-500 ${loading ? 'animate-spin' : ''}`} />
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 w-full max-w-xl">
            <Search size={18} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search in logs..." 
              value={localFilters.search}
              onChange={(e) => setLocalFilters(p => ({ ...p, search: e.target.value }))}
              className="bg-transparent outline-none w-full text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2 border transition-colors ${showFilters ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
              <Filter size={18} />
            </button>
            
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />

            <div className="flex items-center gap-6 text-right">
               <div>
                 <span className="text-[10px] uppercase font-bold text-zinc-400 block leading-none">Total</span>
                 <span className="text-lg font-black">{stats.total}</span>
               </div>
               <div>
                 <span className="text-[10px] uppercase font-bold text-zinc-400 block leading-none text-red-500">Errors</span>
                 <span className="text-lg font-black text-red-500">{stats.errors}</span>
               </div>
            </div>
          </div>
        </header>

        {showFilters && <FilterBar filters={localFilters} setFilters={setLocalFilters} />}

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
            <div className="flex-1 overflow-auto">
              {error ? (
                <div className="h-full flex flex-col items-center justify-center text-red-500 gap-2">
                  <AlertTriangle size={32} />
                  <p className="font-bold">{error}</p>
                </div>
              ) : (
                <LogTable logs={logs} selectedLog={selectedLog} onSelect={setSelectedLog} resetFilters={resetFilters} loading={loading} />
              )}
            </div>
            
            {/* Pagination */}
            <div className="h-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Showing <span className="text-zinc-900 dark:text-zinc-100">{logs.length}</span> of <span className="text-zinc-900 dark:text-zinc-100">{pagination.total}</span> logs
              </div>
              
              <div className="flex items-center gap-2">
                <button disabled={filters.page === 1} onClick={() => handlePageChange(filters.page - 1)} className="p-1 border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    let pageNum = filters.page <= 3 ? i + 1 : filters.page + i - 2;
                    if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (4 - i);
                    if (pageNum < 1) return null;
                    return (
                      <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-8 h-8 flex items-center justify-center text-[11px] font-black border transition-colors ${filters.page === pageNum ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button disabled={filters.page === pagination.totalPages} onClick={() => handlePageChange(filters.page + 1)} className="p-1 border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Page <span className="text-zinc-900 dark:text-zinc-100">{filters.page}</span> of <span className="text-zinc-900 dark:text-zinc-100">{pagination.totalPages}</span>
              </div>
            </div>
          </div>

          {selectedLog && <LogDetail log={selectedLog} onClose={() => setSelectedLog(null)} />}
        </div>
      </main>
    </div>
  );
}
