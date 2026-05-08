import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import Logs from './pages/Logs';
import AdminConfig from './pages/AdminConfig';

// --- Senior Tip: Role-Based Routing ---

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/projects" replace />;
  }
  return <>{children}</>;
};

// Public Route Component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/projects" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={<PublicRoute><Login /></PublicRoute>} 
        />
        <Route 
          path="/register" 
          element={<PublicRoute><Register /></PublicRoute>} 
        />
        
        {/* Project Management */}
        <Route 
          path="/projects" 
          element={<ProtectedRoute><Projects /></ProtectedRoute>} 
        />
        
        {/* Log Viewer (Using projectId instead of apiKey) */}
        <Route 
          path="/projects/:projectId/logs" 
          element={<ProtectedRoute><Logs /></ProtectedRoute>} 
        />

        {/* --- Admin Management --- */}
        <Route 
          path="/admin/config" 
          element={<AdminRoute><AdminConfig /></AdminRoute>} 
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
