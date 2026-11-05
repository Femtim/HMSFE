import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import socket from '../api/socketClient';
import { useAuth } from '../context/AuthContext';

export default function DoctorConsole() {
  const { user } = useAuth();
  const department = user?.doctorProfile?.department || 'GENERAL_OPD';

  const [activeTicket, setActiveTicket] = useState(null);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDoctorWorkspace = useCallback(async () => {
    try {
      const [activeRes, boardRes] = await Promise.all([
        axiosClient.get('/queue/doctor-active'),
        axiosClient.get(`/queue/live-board/${department}`),
      ]);
      setActiveTicket(activeRes.data.data || null);
      const allDeptTickets = boardRes.data.data || [];
      setWaitingQueue(allDeptTickets.filter((t) => t.status === 'WAITING'));
    } catch (err) {
      console.error('Error loading doctor console:', err);
    }
  }, [department]);

  useEffect(() => {
    fetchDoctorWorkspace();
    socket.emit('join:department', department);

    const handleUpdate = () => fetchDoctorWorkspace();
    socket.on('queue:updated', handleUpdate);
    socket.on('queue:patient_called', handleUpdate);

    return () => {
      socket.off('queue:updated', handleUpdate);
      socket.off('queue:patient_called', handleUpdate);
    };
  }, [department, fetchDoctorWorkspace]);

  const handleCallNext = async () => {
    setLoading(true);
    setFeedback('');
    try {
      const res = await axiosClient.patch('/queue/call-next');
      setActiveTicket(res.data.data || null);
      setFeedback(res.data.message || 'Updated queue.');
      await fetchDoctorWorkspace();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not call next patient.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteConsultation = async (ticketId) => {
    setLoading(true);
    setFeedback('');
    try {
      await axiosClient.patch(`/queue/${ticketId}/complete`);
      setActiveTicket(null);
      setFeedback('Consultation marked as completed.');
      await fetchDoctorWorkspace();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Error completing consultation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-[#1E293B] text-white p-6 rounded-3xl shadow-lg flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
            Physician Command Console • {department}
          </span>
          <h1 className="text-2xl font-extrabold mt-1">{user?.fullName}</h1>
          <p className="text-xs text-slate-300">
            Consultation Room: <strong>{user?.doctorProfile?.consultationRoom || 'Room 101'}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleCallNext}
          disabled={loading || !!activeTicket}
          className="bg-[#10B981] hover:bg-emerald-400 disabled:opacity-40 text-slate-900 font-black px-6 py-4 rounded-2xl shadow-lg text-sm transition"
        >
          🔔 Call Next Patient in Queue
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold rounded-2xl">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Active Patient */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-extrabold text-[#1E293B]">
            Active Consultation Room
          </h2>

          {!activeTicket ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No patient currently in consultation. Click <strong>Call Next Patient</strong> to summon
              the highest-priority waiting ticket.
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#312E81] to-slate-900 text-white space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold uppercase bg-[#10B981] text-slate-900 px-3 py-1 rounded-full">
                  {activeTicket.priorityLabel}
                </span>
                <span className="text-3xl font-black">{activeTicket.ticketNumber}</span>
              </div>

              <div className="space-y-1 pt-2 border-t border-indigo-400/30">
                <p className="text-lg font-bold">
                  {activeTicket.patientId?.fullName || 'Patient'}
                </p>
                <p className="text-xs text-indigo-200">
                  Card: {activeTicket.patientId?.patientProfile?.hospitalCardNumber || 'N/A'} •
                  Blood Group: {activeTicket.patientId?.patientProfile?.bloodGroup || 'O+'}
                </p>
                <p className="text-xs text-indigo-200">
                  Phone: {activeTicket.patientId?.phone || 'N/A'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCompleteConsultation(activeTicket._id)}
                disabled={loading}
                className="w-full bg-[#0D9488] hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow transition"
              >
                ✓ Complete & Discharge Patient
              </button>
            </div>
          )}
        </div>

        {/* Waiting Room Queue List */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-extrabold text-[#1E293B]">
            Department Waiting Queue ({waitingQueue.length})
          </h2>

          {waitingQueue.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">
              No patients currently waiting in {department}.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {waitingQueue.map((t, idx) => (
                <div
                  key={t._id || t.ticketNumber}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-extrabold text-sm text-[#1E293B] block">
                        {t.ticketNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Room: {t.consultationRoom}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
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
    </div>
  );
}