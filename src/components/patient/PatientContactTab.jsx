import React from 'react';

export default function PatientContactTab() {
  return (
    <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-semibold text-slate-900">Contact & Facility Directory</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Reach out to the outpatient records desk or emergency triage unit
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded border border-slate-200 bg-slate-50/50 space-y-1">
          <p className="font-semibold text-slate-900">Emergency & Ambulance</p>
          <p className="text-slate-600 font-mono">112 / +234 800 000 0001</p>
          <p className="text-slate-500">Available 24 hours daily</p>
        </div>
        <div className="p-4 rounded border border-slate-200 bg-slate-50/50 space-y-1">
          <p className="font-semibold text-slate-900">Outpatient Records & NHIS</p>
          <p className="text-slate-600">Wing A, Ground Floor</p>
          <p className="text-slate-500">Mon – Fri, 08:00 – 16:00</p>
        </div>
        <div className="p-4 rounded border border-slate-200 bg-slate-50/50 space-y-1">
          <p className="font-semibold text-slate-900">Patient Support Desk</p>
          <p className="text-slate-600">support@hospital.ng</p>
          <p className="text-slate-500">Card verification & portal inquiries</p>
        </div>
      </div>
    </div>
  );
}