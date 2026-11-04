import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginView from './views/LoginView';
import RegisterPatientView from './views/RegisterPatientView';
import PatientPortal from './views/PatientPortal';
import DoctorConsole from './views/DoctorConsole';
import SuperAdminDashboard from './views/SuperAdminDashboard';
import LiveWaitingBoard from './views/LiveWaitingBoard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication & Hallway TV Display Routes */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterPatientView />} />
          <Route path="/tv-board/:department" element={<LiveWaitingBoard />} />

          {/* Protected Patient Portal */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientPortal />
              </ProtectedRoute>
            }
          />

          {/* Protected Doctor Console */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorConsole />
              </ProtectedRoute>
            }
          />

          {/* Protected Super Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}