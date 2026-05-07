import React from 'react';
import { format } from 'date-fns';
import { Clock, Globe } from 'lucide-react';
import type { LogEntry } from '../types';

interface LogTableProps {
  logs: LogEntry[];
  selectedLog: LogEntry | null;
  onSelect: (log: LogEntry) => void;
  resetFilters: () => void;
  loading?: boolean;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'error': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    case 'warn': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    case 'debug': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
    default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  }
};

const LogSkeleton = () => (
  <tr className="animate-pulse border-b border-zinc-100 dark:border-zinc-800/50">
    <td className="px-6 py-5 w-32">
      <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
    </td>
    <td className="px-6 py-5 w-24">
      <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
    </td>
    <td className="px-6 py-5 w-32">
      <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
    </td>
    <td className="px-6 py-5 w-48">
      <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
    </td>
    <td className="px-6 py-5">
      <div className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
    </td>
  </tr>
);

export const LogTable: React.FC<LogTableProps> = ({ logs, selectedLog, onSelect, resetFilters, loading }) => {
  const headers = (
    <thead className={`${loading ? '' : 'sticky top-0'} bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-10`}>
      <tr>
        <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-zinc-400 w-32">Timestamp</th>
        <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-zinc-400 w-24">Level</th>
        <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-zinc-400 w-32">Service</th>
        <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-zinc-400 w-48">Path</th>
        <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-zinc-400">Message</th>
      </tr>
    </thead>
  );

  if (loading) {
    return (
      <table className="w-full text-left border-collapse min-w-[1000px]">
        {headers}
        <tbody>
          {[...Array(10)].map((_, i) => <LogSkeleton key={i} />)}
        </tbody>
      </table>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
        <Clock size={48} strokeWidth={1} />
        <p className="font-bold text-sm uppercase tracking-widest">No logs found.</p>
        <button onClick={resetFilters} className="text-[10px] font-black underline">Reset All Filters</button>
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse min-w-[1000px]">
      {headers}
      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {logs.map((log) => (
          <tr 
            key={log._id} 
            onClick={() => onSelect(log)}
            className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors ${selectedLog?._id === log._id ? 'bg-zinc-100 dark:bg-zinc-900' : ''}`}
          >
            <td className="px-6 py-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
              {log.timestamp ? format(log.timestamp, 'HH:mm:ss.SSS') : 'N/A'}
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 border text-[10px] font-black uppercase tracking-widest ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
            </td>
            <td className="px-6 py-4 text-xs font-bold text-zinc-600 dark:text-zinc-400 truncate max-w-[120px]">
              {log.service}
            </td>
            <td className="px-6 py-4">
              {log.meta?.url ? (
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded w-fit max-w-[180px] truncate">
                  <Globe size={10} className="shrink-0" />
                  <span className="truncate">{log.meta.url}</span>
                </div>
              ) : (
                <span className="text-zinc-300 dark:text-zinc-700">—</span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-medium truncate max-w-xl">{log.message}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
