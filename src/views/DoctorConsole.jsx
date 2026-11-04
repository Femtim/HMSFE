import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function DoctorConsole() {
  const { user, logout } = useAuth();
  const [currentTicket, setCurrentTicket] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const doctorProfile = user?.profile || user?.doctorProfile || {};

  const handleCallNext = async () => {
    setLoading(true);
    setStatusMessage('');
    try {
      const res = await axiosClient.patch('/queue/call-next');
      if (res.data.data) {
        setCurrentTicket(res.data.data);
      } else {
        setStatusMessage(res.data.message || 'No waiting patients in your queue.');
      }
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Error calling next patient.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!currentTicket) return;
    setLoading(true);
    try {
      await axiosClient.patch(`/queue/${currentTicket._id}/complete`);
      setStatusMessage(`Consultation completed for ticket ${currentTicket.ticketNumber}.`);
      setCurrentTicket(null);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Failed to complete consultation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-[#312E81] text-white p-6 rounded-2xl shadow-md flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="bg-[#10B981] text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
              DOCTOR CONSOLE • {doctorProfile.department || 'CLINIC'}
            </span>
            <h1 className="text-2xl font-bold mt-2">{user?.fullName}</h1>
            <p className="text-indigo-200 text-xs mt-0.5">
              {doctorProfile.specialization || 'Medical Officer'} •{' '}
              {doctorProfile.consultationRoom || 'Room 101'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCallNext}
              disabled={loading || currentTicket !== null}
              className="bg-[#10B981] hover:bg-emerald-500 disabled:opacity-50 text-slate-900 font-extrabold px-5 py-3 rounded-xl shadow-lg transition"
            >
              🔊 Call Next Patient
            </button>
            <button
              onClick={logout}
              className="bg-indigo-950 hover:bg-red-600 text-white text-xs font-bold px-4 py-3 rounded-xl transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        {statusMessage && (
          <div className="bg-teal-50 border border-teal-200 text-teal-900 px-4 py-3 rounded-xl text-sm font-medium">
            {statusMessage}
          </div>
        )}

        {/* Active Consultation Panel */}
        {currentTicket ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-wrap justify-between items-start border-b pb-5 gap-4">
              <div>
                <span
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    currentTicket.priorityLabel === 'EMERGENCY'
                      ? 'bg-red-100 text-red-800'
                      : currentTicket.priorityLabel === 'VULNERABLE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {currentTicket.priorityLabel} PRIORITY
                </span>
                <h2 className="text-5xl font-black text-[#1E293B] mt-3">
                  {currentTicket.ticketNumber}
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Waited in Queue: <strong>{currentTicket.metrics?.actualWaitTimeMins || 0} mins</strong>
                </p>
              </div>

              <button
                onClick={handleCompleteConsultation}
                disabled={loading}
                className="bg-[#0D9488] hover:bg-teal-700 text-white font-bold px-6 py-3.5 rounded-xl shadow transition"
              >
                ✓ Complete & Discharge Patient
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs uppercase font-bold">Patient Name</span>
                <strong className="text-base text-slate-800">
                  {currentTicket.patientId?.fullName || 'Walk-In Patient'}
                </strong>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs uppercase font-bold">Hospital Card No.</span>
                <strong className="text-base text-[#312E81]">
                  {currentTicket.patientId?.patientProfile?.hospitalCardNumber || 'N/A'}
                </strong>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs uppercase font-bold">Blood Group / Gender</span>
                <strong className="text-base text-slate-800">
                  {currentTicket.patientId?.patientProfile?.bloodGroup || '-'} /{' '}
                  {currentTicket.patientId?.patientProfile?.gender || '-'}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-14 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
            No active patient in consultation. Click <strong>"🔊 Call Next Patient"</strong> to summon the highest-priority patient waiting in your clinic line.
          </div>
        )}
      </div>
    </div>
  );
}