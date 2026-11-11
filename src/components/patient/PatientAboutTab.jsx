import React from 'react';

export default function PatientAboutTab() {
  return (
    <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-semibold text-slate-900">About LIVING-SOUL GENERAL HOSPITAL</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Intelligent Appointment Booking and Queue Management System
        </p>
      </div>
      <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-w-3xl">
        <p>
          The Hospital Appointment and Queue Management System (HAQMS) is designed to eliminate
          outpatient waiting room congestion across Nigerian tertiary and secondary healthcare
          facilities.
        </p>
        <p>
          By combining scheduled 15-minute consultation slots with automated priority triage
          weighting, HAQMS ensures that emergency cases, elderly patients, and antenatal visitors
          receive timely clinical attention while keeping routine outpatient queues transparent and
          predictable.
        </p>
      </div>
    </div>
  );
}