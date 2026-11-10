import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function PatientDashboardTab() {
  const { user, activeTicket, myAppointments = [] } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Active Queue Status</p>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {activeTicket ? activeTicket.ticketNumber : 'None'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {activeTicket
              ? `${activeTicket.status} · ${activeTicket.consultationRoom}`
              : 'No active check-in today'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Appointments</p>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {myAppointments.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed: {myAppointments.filter((a) => a.status === 'CONFIRMED').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Triage Classification</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {user?.patientProfile?.isVulnerable ? 'Priority' : 'Standard'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Blood Group: {user?.patientProfile?.bloodGroup || 'O+'}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Need to schedule a consultation or check into your queue?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Proceed to the Appointment section to select an outpatient unit and time slot.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/patient/appointment')}
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-4 py-2 rounded transition"
        >
          Go to Appointments
        </button>
      </div>
    </div>
  );
}