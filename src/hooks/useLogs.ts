import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { LogEntry, LogFilters, Pagination, ProjectStats } from '../types';

export function useLogs(projectId: string | undefined, filters: LogFilters, refreshInterval: number) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [stats, setStats] = useState<ProjectStats>({ total: 0, errors: 0, services: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!projectId) return;

    if (!isBackground) setLoading(true);

    try {
      const fromTs = filters.from ? new Date(filters.from).getTime() : '';
      const toTs = filters.to ? new Date(filters.to).getTime() : '';
      
      const params = {
        projectId, // Using projectId for querying
        level: filters.level,
        search: filters.search,
        service: filters.service,
        path: filters.path,
        from: fromTs,
        to: toTs,
        page: filters.page,
        limit: 10
      };

      const [logsRes, statsRes] = await Promise.all([
        api.get('/logs', { params }),
        api.get('/stats', { params: { projectId } })
      ]);

      setLogs(logsRes.data.logs || []);
      setPagination(logsRes.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
      setStats(statsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch logs');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [projectId, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refreshInterval === 0) return;
    const interval = setInterval(() => fetchData(true), refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { logs, pagination, stats, loading, error, refetch: fetchData };
}
