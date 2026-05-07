import React from 'react';
import { format } from 'date-fns';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { LogEntry } from '../types';

interface LogDetailProps {
  log: LogEntry;
  onClose: () => void;
}

export const LogDetail: React.FC<LogDetailProps> = ({ log, onClose }) => {
  return (
    <aside className="w-[500px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shadow-2xl z-20 shrink-0">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <h3 className="font-bold text-sm uppercase tracking-widest">Log Detail</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
           <ArrowLeft size={20} className="rotate-180" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-6 space-y-8">
         <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
               <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Service</span>
               <span className="text-xs font-black text-blue-500">{log.service}</span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
               <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Environment</span>
               <span className="text-xs font-black text-emerald-500 uppercase">{log.env || 'N/A'}</span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
               <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Level</span>
               <span className={`text-xs font-black uppercase ${log.level === 'error' ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-400'}`}>{log.level}</span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
               <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Time</span>
               <span className="text-xs font-bold">{log.timestamp ? format(log.timestamp, 'HH:mm:ss.SSS') : 'N/A'}</span>
            </div>
         </div>

         <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Log Message</span>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 border-l-4 border-zinc-300 dark:border-zinc-700 font-bold text-sm leading-relaxed">
               {log.message}
            </div>
         </div>

         {(log.meta?.url || log.meta?.method) && (
            <div className="space-y-3">
               <span className="text-[10px] uppercase font-bold text-zinc-400">Request Context</span>
               <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                     <span className="px-2 py-0.5 bg-zinc-900 text-white font-black rounded-sm">{log.meta.method}</span>
                     <span className="font-mono text-zinc-500 truncate">{log.meta.url}</span>
                  </div>
                  {log.meta.status && (
                     <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-zinc-400">Status:</span>
                        <span className={log.meta.status >= 400 ? 'text-red-500' : 'text-emerald-500'}>{log.meta.status}</span>
                        <span className="text-zinc-300 ml-2">|</span>
                        <span className="text-zinc-400 ml-2">Duration:</span>
                        <span className="text-zinc-600 dark:text-zinc-300">{log.meta.duration}ms</span>
                     </div>
                  )}
               </div>
            </div>
         )}

         {log.meta?.stack && (
            <div className="space-y-2">
               <span className="text-[10px] uppercase font-bold text-red-500 flex items-center gap-2">
                  <AlertTriangle size={12} /> Stack Trace
               </span>
               <div className="p-4 bg-zinc-950 text-red-400 text-[11px] font-mono border border-zinc-800 overflow-auto max-h-[400px] leading-relaxed">
                  {log.meta.stack.split('\n').map((line, i) => (
                     <div key={i} className={i === 0 ? 'font-black mb-2 text-red-300' : 'opacity-80 pl-4 border-l border-red-900/30'}>
                        {line}
                     </div>
                  ))}
               </div>
            </div>
         )}

         <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Full Record Data</span>
            <pre className="p-4 bg-zinc-950 text-emerald-400 text-[11px] font-mono border border-zinc-800 overflow-auto max-h-[400px]">
              {JSON.stringify({
                _id: log._id,
                projectId: log.projectId,
                ...log
              }, (key, value) => key === 'stack' ? 'See stack section above...' : value, 2)}
            </pre>
         </div>
      </div>
    </aside>
  );
};
