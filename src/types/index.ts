export interface LogEntry {
  _id: string;
  timestamp: number;
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
  service: string;
  env: string;
  projectId: string;
  meta?: {
    url?: string;
    method?: string;
    status?: number;
    duration?: number;
    ip?: string;
    stack?: string;
    [key: string]: any;
  };
}

export interface DatabaseType {
  _id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Project {
  _id: string;
  name: string;
  apiKey: string;
  platform: 'node' | 'react' | 'nextjs' | 'python' | 'go';
  dbStrategy: 'managed' | 'custom';
  dbType?: DatabaseType;
  dbConfig: {
    customUri?: string;
    whitelistedIps: string[];
    managedCredentials?: {
      username: string;
      password?: string; // Only returned if user has access
      host: string;
      port: number;
      databaseName: string;
    }
  };
  createdAt: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectStats {
  total: number;
  errors: number;
  services: number;
}

export interface LogFilters {
  level: string;
  search: string;
  service: string;
  path: string;
  from: string;
  to: string;
  page: number;
}
