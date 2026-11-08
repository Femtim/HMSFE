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
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-8 font-sans flex flex-col justify-between">
      <div className="space-y-6">
        <header className="flex flex-wrap justify-between items-center gap-4 bg-slate-900 p-5 rounded-lg border border-slate-800">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-teal-400">
              Outpatient Queue Monitor
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">
              {normalizedDept.replace('_', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={normalizedDept}
              onChange={(e) => navigate(`/tv-board/${e.target.value}`)}
              className="bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded border border-slate-700"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d.replace('_', ' ')}
                </option>
              ))}
            </select>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Last Sync</span>
              <span className="text-xs font-mono text-slate-200">
                {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-3">
              Now Calling
            </h2>

            {calledTickets.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                No active call at this moment. Please wait for your ticket number.
              </div>
            ) : (
              <div className="space-y-3">
                {calledTickets.map((t) => (
                  <div
                    key={t._id || t.ticketNumber}
                    className="bg-teal-950/60 border border-teal-700/60 p-5 rounded-md flex justify-between items-center"
                  >
                    <div>
                      <span className="text-xs font-medium uppercase text-teal-400 block">
                        Proceed To
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {t.consultationRoom}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {t.doctorId?.fullName || 'Clinician'}
                      </span>
                    </div>
                    <span className="text-4xl font-mono font-bold text-teal-300">
                      {t.ticketNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
              Waiting Queue ({waitingTickets.length})
            </h2>

            {waitingTickets.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                No waiting tickets in this unit.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {waitingTickets.map((t) => (
                  <div
                    key={t._id || t.ticketNumber}
                    className="p-3.5 rounded-md bg-slate-950 border border-slate-800 text-center space-y-1"
                  >
                    <span className="text-xl font-mono font-bold text-white block">
                      {t.ticketNumber}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      {t.consultationRoom}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 pt-6 border-t border-slate-900">
        Please have your Hospital Card ready when approaching the consultation room.
      </footer>
    </div>
  );
}