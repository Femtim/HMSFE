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

import PatientDashboardTab from './components/patient/PatientDashboardTab';
import PatientAppointmentTab from './components/patient/PatientAppointmentTab';
import PatientServicesTab from './components/patient/PatientServicesTab';
import PatientAboutTab from './components/patient/PatientAboutTab';
import PatientContactTab from './components/patient/PatientContactTab';
import PatientProfileTab from './components/patient/PatientProfileTab';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterPatientView />} />
          <Route path="/verify-email/:token" element={<VerifyEmailView />} />
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/reset-password/:token" element={<ResetPasswordView />} />
          <Route path="/tv-board/:department" element={<LiveWaitingBoard />} />

          {/* Nested Patient Routes using Outlet */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  <PatientPortal />
                </DashboardLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="appointment" replace />} />
            <Route path="dashboard" element={<PatientDashboardTab />} />
            <Route path="appointment" element={<PatientAppointmentTab />} />
            <Route path="services" element={<PatientServicesTab />} />
            <Route path="about" element={<PatientAboutTab />} />
            <Route path="contact" element={<PatientContactTab />} />
            <Route path="profile" element={<PatientProfileTab />} />
          </Route>

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

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}