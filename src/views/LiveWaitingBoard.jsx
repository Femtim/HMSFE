import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import socket from '../api/socketClient';

const DEPARTMENTS = [
  'GENERAL_OPD',
  'PEDIATRICS',
  'CARDIOLOGY',
  'OBGYN',
  'ORTHOPEDICS',
  'DENTAL',
];

export default function LiveWaitingBoard() {
  const { department } = useParams();
  const navigate = useNavigate();
  const normalizedDept = (department || 'GENERAL_OPD').toUpperCase();

  const [tickets, setTickets] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchBoard = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/queue/live-board/${normalizedDept}`);
      setTickets(res.data.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Live board error:', err);
    }
  }, [normalizedDept]);

  useEffect(() => {
    fetchBoard();
    socket.emit('join:department', normalizedDept);

    const handleRefresh = () => fetchBoard();
    socket.on('queue:updated', handleRefresh);
    socket.on('queue:patient_called', handleRefresh);

    const interval = setInterval(fetchBoard, 8000);
    return () => {
      socket.off('queue:updated', handleRefresh);
      socket.off('queue:patient_called', handleRefresh);
      clearInterval(interval);
    };
  }, [normalizedDept, fetchBoard]);

  const calledTickets = tickets.filter(
    (t) => t.status === 'CALLED' || t.status === 'IN_CONSULTATION'
  );
  const waitingTickets = tickets.filter((t) => t.status === 'WAITING');

  return (
    <div className="min-h-screen bg-[#1E293B] text-white p-6 sm:p-10 font-sans flex flex-col justify-between">
      <div className="space-y-8">
        {/* Top TV Header */}
        <header className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-700">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#10B981]">
              Live Hospital Waiting Room Display
            </span>
            <h1 className="text-3xl font-black tracking-tight mt-1">
              {normalizedDept.replace('_', ' ')} QUEUE
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={normalizedDept}
              onChange={(e) => navigate(`/tv-board/${e.target.value}`)}
              className="bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-600"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d.replace('_', ' ')}
                </option>
              ))}
            </select>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Updated</span>
              <span className="text-sm font-mono font-bold text-[#10B981]">
                {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </header>

        {/* Main TV Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Now Serving Column */}
          <div className="bg-gradient-to-br from-[#0D9488] to-teal-900 p-8 rounded-3xl shadow-2xl space-y-6">
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-teal-100">
              🔊 Now Calling / In Consultation
            </h2>

            {calledTickets.length === 0 ? (
              <div className="py-16 text-center text-teal-200/70 text-lg font-semibold">
                Please wait. The next ticket will be called shortly.
              </div>
            ) : (
              <div className="space-y-4">
                {calledTickets.map((t) => (
                  <div
                    key={t._id || t.ticketNumber}
                    className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl flex justify-between items-center animate-pulse"
                  >
                    <div>
                      <span className="text-xs font-extrabold uppercase text-[#0D9488] block">
                        Proceed Immediately To
                      </span>
                      <span className="text-2xl font-black text-[#312E81]">
                        {t.consultationRoom}
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {t.doctorId?.fullName || 'Attending Physician'}
                      </span>
                    </div>
                    <span className="text-5xl font-black tracking-tighter text-[#1E293B]">
                      {t.ticketNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Waiting Tickets Column */}
          <div className="bg-slate-900/70 p-8 rounded-3xl border border-slate-700 space-y-6">
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-slate-300">
              ⏳ Waiting in Line ({waitingTickets.length})
            </h2>

            {waitingTickets.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-base">
                No waiting tickets in this department.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {waitingTickets.map((t) => (
                  <div
                    key={t._id || t.ticketNumber}
                    className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-1"
                  >
                    <span className="text-2xl font-black text-white block">
                      {t.ticketNumber}
                    </span>
                    <span className="text-[11px] font-bold text-[#10B981] block">
                      {t.consultationRoom}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 pt-8">
        HAQMS Intelligent Queue Management System • Keep your Hospital Card ready when called
      </footer>
    </div>
  );
}