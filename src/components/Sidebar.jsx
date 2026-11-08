import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from './Navbar';

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  tvDepartment,
  setTvDepartment,
  selectedNavSection,
  setSelectedNavSection,
  onOpenInfoModal,
  onOpenSettingsModal,
}) {
  const { user, logout } = useAuth();

  const cardNumber =
    user?.hospitalCardNumber || user?.patientProfile?.hospitalCardNumber || 'STAFF-ID';

  const roleNavigation = {
    PATIENT: [
      { id: 'dashboard', label: 'Appointments & Check-In' },
      { id: 'queue', label: 'Queue Status' },
      { id: 'card', label: 'Patient Card Details' },
      { id: 'departments', label: 'Clinic Hours & Units' },
    ],
    DOCTOR: [
      { id: 'dashboard', label: 'Consultation Desk' },
      { id: 'triage', label: 'Triage Protocol' },
      { id: 'schedule', label: 'Shift & Room Assignment' },
    ],
    SUPER_ADMIN: [
      { id: 'dashboard', label: 'Staff & Operations' },
      { id: 'analytics', label: 'Department Metrics' },
      { id: 'directory', label: 'Clinician Directory' },
    ],
  };

  const navItems = roleNavigation[user?.role] || roleNavigation.PATIENT;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-20 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-150 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="bg-slate-800/80 p-3.5 rounded border border-slate-700/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                {user?.role?.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono text-slate-400">{cardNumber}</span>
            </div>
            <div>
              <h3 className="font-medium text-slate-100 text-sm truncate">{user?.fullName}</h3>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>

            {user?.role === 'PATIENT' && (
              <div className="pt-2 border-t border-slate-700/80 flex justify-between text-xs text-slate-400">
                <span>
                  Blood Group: <strong className="text-slate-200">{user?.patientProfile?.bloodGroup || 'O+'}</strong>
                </span>
                <span>
                  Priority:{' '}
                  <strong className="text-slate-200">
                    {user?.patientProfile?.isVulnerable ? 'Elevated' : 'Standard'}
                  </strong>
                </span>
              </div>
            )}

            {user?.role === 'DOCTOR' && (
              <div className="pt-2 border-t border-slate-700/80 flex justify-between text-xs text-slate-400">
                <span>
                  Unit: <strong className="text-slate-200">{user?.doctorProfile?.department || 'OPD'}</strong>
                </span>
                <span>
                  Room: <strong className="text-slate-200">{user?.doctorProfile?.consultationRoom || '101'}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2.5 mb-1.5">
              Navigation
            </p>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedNavSection(item.id);
                  if (item.id !== 'dashboard') {
                    onOpenInfoModal();
                  }
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition ${
                  selectedNavSection === item.id
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Monitor Display
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                LIVE
              </span>
            </div>
            <select
              value={tvDepartment}
              onChange={(e) => setTvDepartment(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-teal-600"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <Link
              to={`/tv-board/${tvDepartment}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-1.5 rounded border border-slate-700 transition"
            >
              Launch Display Window
            </Link>
          </div>

          <div className="border-t border-slate-800 pt-4 px-1 space-y-1.5 text-xs text-slate-400 font-normal">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Facility Hours
            </p>
            <p className="flex justify-between">
              <span>Outpatient:</span>
              <span className="text-slate-300">08:00 – 16:00</span>
            </p>
            <p className="flex justify-between">
              <span>Emergency:</span>
              <span className="text-slate-300">24 Hours</span>
            </p>
            <p className="flex justify-between">
              <span>Records:</span>
              <span className="text-slate-300">Wing A, Grnd Flr</span>
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              onOpenSettingsModal();
              setSidebarOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            Account Security
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded text-xs font-medium text-red-400 hover:bg-red-950/40 transition"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}