import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import LoginView from './views/LoginView';
import RegisterPatientView from './views/RegisterPatientView';
import VerifyEmailView from './views/VerifyEmailView';
import ForgotPasswordView from './views/ForgotPasswordView';
import ResetPasswordView from './views/ResetPasswordView';
import PatientPortal from './views/PatientPortal';
import DoctorConsole from './views/DoctorConsole';
import SuperAdminDashboard from './views/SuperAdminDashboard';
import LiveWaitingBoard from './views/LiveWaitingBoard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterPatientView />} />
          <Route path="/verify-email/:token" element={<VerifyEmailView />} />
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/reset-password/:token" element={<ResetPasswordView />} />
          <Route path="/tv-board/:department" element={<LiveWaitingBoard />} />

          {/* Patient Protected Route (With Navbar & Sidebar) */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  <PatientPortal />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Doctor Protected Route (With Navbar & Sidebar) */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                  <DoctorConsole />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Super Admin Protected Route (With Navbar & Sidebar) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <DashboardLayout>
                  <SuperAdminDashboard />
                </DashboardLayout>
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