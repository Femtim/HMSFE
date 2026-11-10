import React from 'react';
import { Link } from 'react-router-dom';
import { DEPARTMENTS } from './navConfig';

export default function TvMonitorControl({
  tvDepartment,
  setTvDepartment,
  variant = 'navbar',
}) {
  if (variant === 'sidebar') {
    return (
      <div className="bg-slate-800/40 border border-slate-800 rounded p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">Monitor Display</span>
          <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
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
    );
  }

  return (
    <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/80 rounded px-2.5 py-1 gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      <span className="text-xs text-slate-300 font-medium">Monitor:</span>
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
        Live View
      </Link>
    </div>
  );
}