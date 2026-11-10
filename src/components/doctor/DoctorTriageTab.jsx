import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function DoctorTriageTab() {
  const { waitingQueue = [] } = useOutletContext();

  const emergencyCount = waitingQueue.filter((t) => t.priorityLabel === 'EMERGENCY').length;
  const vulnerableCount = waitingQueue.filter((t) => t.priorityLabel === 'VULNERABLE').length;
  const routineCount = waitingQueue.filter((t) => t.priorityLabel === 'ROUTINE').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
            Weight 3 · Emergency
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{emergencyCount}</p>
          <p className="text-xs text-slate-500 mt-1">Immediate clinical intervention</p>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            Weight 2 · Vulnerable
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{vulnerableCount}</p>
          <p className="text-xs text-slate-500 mt-1">Elderly (65+), antenatal, or disabled</p>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
            Weight 1 · Routine
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{routineCount}</p>
          <p className="text-xs text-slate-500 mt-1">Standard outpatient check-in order</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Clinical Queue Sorting Protocol
        </h2>
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            The HAQMS queue engine orders waiting tickets by priority weight descending, followed by
            check-in timestamp ascending (<span className="font-mono">priorityWeight: -1, checkInTime: 1</span>).
          </p>
          <p>
            When <strong>Call Next Patient</strong> is triggered, the system atomically transitions
            the highest-priority waiting ticket to <span className="font-mono">CALLED</span> and
            broadcasts a real-time Socket.io event to the waiting area display monitor.
          </p>
        </div>
      </div>
    </div>
  );
}