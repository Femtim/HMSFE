import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DEPARTMENTS = [
  { id: 'GENERAL_OPD', label: 'General OPD' },
  { id: 'PEDIATRICS', label: 'Pediatrics' },
  { id: 'CARDIOLOGY', label: 'Cardiology' },
  { id: 'OBGYN', label: 'OB-GYN' },
  { id: 'ORTHOPEDICS', label: 'Orthopedics' },
  { id: 'DENTAL', label: 'Dental' },
];

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
  tvDepartment,
  setTvDepartment,
  onOpenSettings,
}) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-slate-100 border-b border-slate-800 px-4 lg:px-6 h-14 flex items-center justify-between">
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
          <div className="w-6 h-6 rounded bg-teal-700 flex items-center justify-center font-bold text-xs tracking-wider text-white">
            LH
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-white">
              LIVING HOSPITAL
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-normal">
              Hospital Queue & Appointment System
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/80 rounded px-2.5 py-1 gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-300 font-medium">Display Unit:</span>
          <select
            value={tvDepartment}
            onChange={(e) => setTvDepartment(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-teal-600"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.label}
              </option>
            ))}
          </select>
          <Link
            to={`/tv-board/${tvDepartment}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 text-xs font-medium px-2 py-1 rounded border border-slate-700 transition"
          >
            Open Monitor View
          </Link>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded border border-slate-700 transition"
        >
          Account Settings
        </button>

        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-xs text-slate-300 uppercase">
            {user?.fullName?.slice(0, 2) || 'US'}
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-medium text-slate-200 truncate max-w-[130px]">
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