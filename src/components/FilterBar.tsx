import React from 'react';
import { Server, Globe, Calendar } from 'lucide-react';
import type { LogFilters } from '../types';

interface FilterBarProps {
  filters: LogFilters;
  setFilters: React.Dispatch<React.SetStateAction<LogFilters>>;
}

/**
 * Senior Tip: Functional components should be focused. 
 * This component only handles the filter inputs.
 */
export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  const handleChange = (field: keyof LogFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 grid grid-cols-4 gap-4 shrink-0 shadow-sm">
      <div className="space-y-1">
        <label className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
          <Server size={10}/> Service
        </label>
        <input 
          type="text" 
          value={filters.service} 
          onChange={(e) => handleChange('service', e.target.value)}
          placeholder="Service name..."
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs outline-none focus:border-zinc-400 transition-colors"
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
          <Globe size={10}/> Path
        </label>
        <input 
          type="text" 
          value={filters.path} 
          onChange={(e) => handleChange('path', e.target.value)}
          placeholder="URL path..."
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
          <Calendar size={10}/> From
        </label>
        <input 
          type="datetime-local" 
          value={filters.from} 
          onChange={(e) => handleChange('from', e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
          <Calendar size={10}/> To
        </label>
        <input 
          type="datetime-local" 
          value={filters.to} 
          onChange={(e) => handleChange('to', e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs outline-none focus:border-zinc-400 transition-colors"
        />
      </div>
    </div>
  );
};
