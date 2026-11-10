import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function DoctorDeskTab() {
  const {
    department,
    activeTicket,
    waitingQueue = [],
    loading,
    onCompleteConsultation,
  } = useOutletContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Active Consultation
        </h2>

        {!activeTicket ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No active patient in room. Select <strong>Call Next Patient</strong> to summon the next
            ticket.
          </div>
        ) : (
          <div className="p-4 rounded bg-slate-900 text-white space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-medium uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                {activeTicket.priorityLabel}
              </span>
              <span className="text-xl font-bold font-mono">{activeTicket.ticketNumber}</span>
            </div>

            <div className="space-y-1 pt-2.5 border-t border-slate-800 text-xs text-slate-300">
              <p className="text-sm font-semibold text-white">
                {activeTicket.patientId?.fullName || 'Patient'}
              </p>
              <p>
                Card Number:{' '}
                <span className="font-mono text-white">
                  {activeTicket.patientId?.patientProfile?.hospitalCardNumber || 'N/A'}
                </span>{' '}
                · Blood Group:{' '}
                <strong className="text-white">
                  {activeTicket.patientId?.patientProfile?.bloodGroup || 'O+'}
                </strong>
              </p>
              <p>Phone: {activeTicket.patientId?.phone || 'N/A'}</p>
            </div>

            <button
              type="button"
              onClick={() => onCompleteConsultation(activeTicket._id)}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2 rounded text-xs transition"
            >
              Complete & Discharge
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Waiting Queue ({waitingQueue.length})
        </h2>

        {waitingQueue.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">
            No patients waiting in {department}.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {waitingQueue.map((t, idx) => (
              <div
                key={t._id || t.ticketNumber}
                className="p-3 rounded border border-slate-200 bg-slate-50 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-mono font-semibold text-sm text-slate-900 block">
                      {t.ticketNumber}
                    </span>
                    <span className="text-xs text-slate-500">{t.consultationRoom}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    t.priorityLabel === 'EMERGENCY'
                      ? 'bg-red-100 text-red-700'
                      : t.priorityLabel === 'VULNERABLE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.priorityLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}