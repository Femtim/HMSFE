import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function AdminDirectoryTab() {
  const { doctors = [], onToggleAvailability } = useOutletContext();

  return (
    <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Registered Clinicians ({doctors.length})
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage daily clinician duty status and room assignments
        </p>
      </div>

      {doctors.length === 0 ? (
        <p className="text-xs text-slate-400 py-12 text-center">
          No clinicians registered yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => {
            const isAvailable = doc.doctorProfile?.isAvailableToday;
            return (
              <div
                key={doc._id}
                className="p-3.5 rounded border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xs text-slate-900">{doc.fullName}</h3>
                    <p className="text-[11px] text-slate-500">{doc.email}</p>
                    <p className="text-[11px] text-slate-500">{doc.phone}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isAvailable ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  {doc.doctorProfile?.department} · {doc.doctorProfile?.consultationRoom}
                </p>

                <button
                  type="button"
                  onClick={() => onToggleAvailability(doc._id, isAvailable)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs py-1.5 rounded transition"
                >
                  Set {isAvailable ? 'Off Duty' : 'On Duty'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}