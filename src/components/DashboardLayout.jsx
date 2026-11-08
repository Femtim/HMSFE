import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SettingsModal from './SettingsModal';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tvDepartment, setTvDepartment] = useState(
    user?.doctorProfile?.department || 'GENERAL_OPD'
  );
  const [activeModal, setActiveModal] = useState(null);
  const [selectedNavSection, setSelectedNavSection] = useState('dashboard');

  const cardNumber =
    user?.hospitalCardNumber || user?.patientProfile?.hospitalCardNumber || 'STAFF-ID';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tvDepartment={tvDepartment}
        setTvDepartment={setTvDepartment}
        onOpenSettings={() => setActiveModal('settings')}
      />

      <div className="flex-1 flex relative">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          tvDepartment={tvDepartment}
          setTvDepartment={setTvDepartment}
          selectedNavSection={selectedNavSection}
          setSelectedNavSection={setSelectedNavSection}
          onOpenInfoModal={() => setActiveModal('info')}
          onOpenSettingsModal={() => setActiveModal('settings')}
        />

        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>

      {activeModal === 'info' && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-lg border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                Clinical Operations & Triage Protocol
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setSelectedNavSection('dashboard');
                }}
                className="text-slate-500 hover:text-slate-800 text-xs font-medium"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <strong className="text-slate-800 block mb-1">
                  Patient Identification
                </strong>
                Provide card number <span className="font-mono font-semibold text-slate-800">{cardNumber}</span> at registration or nursing triage desks. Queue numbers update dynamically across display monitors.
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <strong className="text-slate-800 block mb-1">Queue Triage Priority</strong>
                Outpatient sorting adheres to clinical priority tiers:
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600">
                  <li>
                    <strong>Emergency:</strong> Immediate life-support or acute trauma intervention.
                  </li>
                  <li>
                    <strong>Vulnerable:</strong> Elderly patients (65+), antenatal care, and individuals with physical impairments.
                  </li>
                  <li>
                    <strong>Routine:</strong> Standard scheduled outpatient consultation order.
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <strong className="text-slate-800 block mb-1">
                  Available Outpatient Units
                </strong>
                General OPD, Pediatrics, Cardiology, Obstetrics & Gynecology, Orthopedics, and Dental Clinic.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                setSelectedNavSection('dashboard');
              }}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 rounded text-xs transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}