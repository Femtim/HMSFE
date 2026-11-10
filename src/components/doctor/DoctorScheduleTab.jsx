import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function DoctorScheduleTab() {
  const { user, department } = useOutletContext();
  const profile = user?.doctorProfile || {};
  const workingDays = profile.workingDays?.length
    ? profile.workingDays
    : ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  return (
    <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">Shift & Consultation Room Assignment</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Active clinical schedule and slot generation parameters
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block">Assigned Department</span>
          <strong className="text-slate-900 text-sm">{department}</strong>
        </div>

        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block">Consultation Room</span>
          <strong className="text-slate-900 text-sm">{profile.consultationRoom || 'Room 101'}</strong>
        </div>

        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block">Specialization</span>
          <strong className="text-slate-900 text-sm">
            {profile.specialization || 'General Medical Officer'}
          </strong>
        </div>

        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block">Shift Hours</span>
          <strong className="text-slate-900 text-sm font-mono">
            {profile.shiftHours?.start || '08:00'} – {profile.shiftHours?.end || '16:00'}
          </strong>
        </div>

        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block">Slot Interval</span>
          <strong className="text-slate-900 text-sm font-mono">
            {profile.avgConsultationTimeMins || 15} mins
          </strong>
        </div>

        <div className="p-3.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block">Duty Status Today</span>
          <strong className="text-slate-900 text-sm">
            {profile.isAvailableToday !== false ? 'On Duty' : 'Off Duty'}
          </strong>
        </div>
      </div>

      <div className="pt-2">
        <span className="text-xs font-medium text-slate-600 block mb-2">Active Working Days</span>
        <div className="flex flex-wrap gap-2">
          {workingDays.map((day) => (
            <span
              key={day}
              className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-teal-50 text-teal-800 border border-teal-200"
            >
              {day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}