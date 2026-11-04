import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { socket } from '../api/socketClient';

export default function LiveWaitingBoard() {
  const { department = 'GENERAL_OPD' } = useParams();
  const normalizedDept = department.toUpperCase();

  const [queueList, setQueueList] = useState([]);
  const [lastCalled, setLastCalled] = useState(null);

  const fetchBoard = async () => {
    try {
      const res = await axiosClient.get(`/queue/live-board/${normalizedDept}`);
      setQueueList(res.data.data || []);
    } catch (err) {
      console.error('Failed to load live board:', err);
    }
  };

  useEffect(() => {
    fetchBoard();
    socket.emit('join:department', normalizedDept);

    const handlePatientCalled = (announcement) => {
      setLastCalled(announcement);
      fetchBoard();
    };

    const handleQueueUpdated = () => {
      fetchBoard();
    };

    socket.on('queue:patient_called', handlePatientCalled);
    socket.on('queue:updated', handleQueueUpdated);

    return () => {
      socket.off('queue:patient_called', handlePatientCalled);
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [normalizedDept]);

  return (
    <div className="min-h-screen bg-[#1E293B] text-white p-8 font-sans grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Spotlight: Now Calling */}
      <div className="lg:col-span-1 bg-[#312E81] rounded-3xl p-8 flex flex-col justify-between shadow-2xl border border-indigo-700">
        <div>
          <span className="px-4 py-1.5 rounded-full bg-[#10B981] text-slate-900 font-bold text-xs uppercase tracking-widest">
            Live Waiting Area Feed
          </span>
          <h1 className="text-3xl font-extrabold mt-4">{normalizedDept.replace('_', ' ')}</h1>
          <p className="text-indigo-200 text-sm">Watch screen for your ticket number</p>
        </div>

        {lastCalled ? (
          <div className="my-auto text-center bg-white/10 p-8 rounded-2xl border border-white/20 animate-pulse">
            <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
              Now Calling Ticket
            </p>
            <p className="text-7xl font-black text-white my-4">{lastCalled.ticketNumber}</p>
            <p className="text-2xl font-bold text-[#10B981]">
              Proceed to {lastCalled.consultationRoom}
            </p>
          </div>
        ) : (
          <div className="my-auto text-center text-indigo-300 text-sm">
            Waiting for next doctor call...
          </div>
        )}

        <div className="text-xs text-indigo-300 text-center">
          Emergency & Vulnerable Patients Are Prioritized Automatically
        </div>
      </div>

      {/* Right Table: Active Department Queue */}
      <div className="lg:col-span-2 bg-slate-800/80 rounded-3xl p-8 border border-slate-700">
        <h2 className="text-xl font-bold mb-6 text-slate-200">Active Queue Lineup</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4">Ticket</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Room</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-lg">
              {queueList.map((item) => (
                <tr
                  key={item._id}
                  className={item.status === 'CALLED' ? 'bg-emerald-900/40 font-bold' : ''}
                >
                  <td className="p-4 font-mono text-2xl text-white">{item.ticketNumber}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        item.priorityLabel === 'EMERGENCY'
                          ? 'bg-red-500/20 text-red-300'
                          : item.priorityLabel === 'VULNERABLE'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.priorityLabel}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{item.consultationRoom}</td>
                  <td className="p-4">
                    <span
                      className={
                        item.status === 'CALLED' ? 'text-[#10B981] font-extrabold' : 'text-slate-400'
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {queueList.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500 text-base">
                    No patients currently waiting in {normalizedDept}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}