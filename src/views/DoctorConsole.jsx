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
      setFeedback(res.data.message || 'Queue updated.');
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
      setFeedback('Consultation completed.');
      await fetchDoctorWorkspace();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Error completing consultation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white border border-slate-200 p-5 rounded-md shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Consultation Desk · {department}
          </span>
          <h1 className="text-lg font-semibold text-slate-900 mt-0.5">{user?.fullName}</h1>
          <p className="text-xs text-slate-500">
            Assigned Room:{' '}
            <strong className="text-slate-800">
              {user?.doctorProfile?.consultationRoom || 'Room 101'}
            </strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleCallNext}
          disabled={loading || !!activeTicket}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-medium px-4 py-2 rounded text-xs transition"
        >
          Call Next Patient
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium rounded">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Active Consultation
          </h2>

          {!activeTicket ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No active patient in room. Select <strong>Call Next Patient</strong> to summon the next ticket.
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
                onClick={() => handleCompleteConsultation(activeTicket._id)}
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
    </div>
  );
}