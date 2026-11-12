import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleTopNav from './navigation/RoleTopNav';
import TvMonitorControl from './navigation/TvMonitorControl';

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
  tvDepartment,
  setTvDepartment,
  onOpenSettings,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPatient = user?.role === 'PATIENT';

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-slate-100 border-b border-slate-800 px-4 lg:px-8 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          
            <img src="/image2.png" alt="" className='h-12' />
          
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-white">LIVING-SOUL GENERAL HOSPITAL</span>
            <span className="hidden xl:inline-block text-xs text-slate-400 font-normal">
              Hospital Queue & Appointment System
            </span>
          </div>
        </div>
      </div>

      {/* <RoleTopNav role={user?.role} /> */}

      <div className="flex items-center gap-3">
        <TvMonitorControl
          tvDepartment={tvDepartment}
          setTvDepartment={setTvDepartment}
          variant="navbar"
        />

        {!isPatient && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded border border-slate-700 transition"
          >
            Account Settings
          </button>
        )}

        <div
          onClick={() => {
            if (isPatient) navigate('/patient/profile');
          }}
          className={`hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-800 ${
            isPatient ? 'cursor-pointer' : ''
          }`}
        >
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-xs text-slate-300 uppercase">
            {user?.fullName?.slice(0, 2) || 'US'}
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
              {user?.fullName}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}