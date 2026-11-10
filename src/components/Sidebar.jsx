import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarNavMenu from './navigation/SidebarNavMenu';
import TvMonitorControl from './navigation/TvMonitorControl';

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  tvDepartment,
  setTvDepartment,
  onOpenSettingsModal,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isPatient = user?.role === 'PATIENT';

  const cardNumber =
    user?.hospitalCardNumber || user?.patientProfile?.hospitalCardNumber || 'STAFF-ID';

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

            {isPatient && (
              <div className="pt-2 border-t border-slate-700/80 flex justify-between text-xs text-slate-400">
                <span>
                  Blood Group:{' '}
                  <strong className="text-slate-200">
                    {user?.patientProfile?.bloodGroup || 'O+'}
                  </strong>
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
                  Unit:{' '}
                  <strong className="text-slate-200">
                    {user?.doctorProfile?.department || 'OPD'}
                  </strong>
                </span>
                <span>
                  Room:{' '}
                  <strong className="text-slate-200">
                    {user?.doctorProfile?.consultationRoom || '101'}
                  </strong>
                </span>
              </div>
            )}
          </div>

          <SidebarNavMenu
            role={user?.role}
            onCloseMobileSidebar={() => setSidebarOpen(false)}
          />

          <TvMonitorControl
            tvDepartment={tvDepartment}
            setTvDepartment={setTvDepartment}
            variant="sidebar"
          />

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
              if (isPatient) {
                navigate('/patient/profile');
              } else {
                onOpenSettingsModal();
              }
              setSidebarOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            {isPatient ? 'Profile & Settings' : 'Account Security'}
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