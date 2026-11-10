import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200 text-sm font-medium">
        Loading clinical workspace...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/patient" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor" replace />;
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}