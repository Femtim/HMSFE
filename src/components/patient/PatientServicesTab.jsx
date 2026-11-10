import React from 'react';
import { DEPARTMENTS } from '../navigation/navConfig';

export default function PatientServicesTab() {
  return (
    <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-semibold text-slate-900">
          Clinical Services & Outpatient Units
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Specialized departments integrated with real-time queue management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEPARTMENTS.map((dept) => (
          <div
            key={dept.id}
            className="p-4 rounded border border-slate-200 bg-slate-50/50 space-y-2"
          >
            <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              {dept.id}
            </span>
            <h3 className="text-sm font-semibold text-slate-900">{dept.label}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{dept.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}