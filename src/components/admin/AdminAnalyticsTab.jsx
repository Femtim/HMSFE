import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function AdminAnalyticsTab() {
  const { analytics = [], fetchAdminData } = useOutletContext();

  const totalCheckedIn = analytics.reduce((acc, item) => acc + (item.totalPatients || 0), 0);
  const totalWaiting = analytics.reduce((acc, item) => acc + (item.waitingCount || 0), 0);
  const totalCompleted = analytics.reduce((acc, item) => acc + (item.completedCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Check-Ins Today</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{totalCheckedIn}</p>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Currently Waiting</p>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-2">{totalWaiting}</p>
        </div>

        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Completed Consultations</p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-2">{totalCompleted}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Department Queue Metrics
          </h2>
          <button
            type="button"
            onClick={fetchAdminData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded transition"
          >
            Refresh Metrics
          </button>
        </div>

        {analytics.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">
            No department queue activity recorded today.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.map((item, idx) => (
              <div
                key={item.department || item._id || idx}
                className="p-4 rounded border border-slate-200 bg-slate-50 flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold text-sm text-slate-900">
                    {item.department || item._id}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total Tickets: <strong className="font-mono">{item.totalPatients}</strong>
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-medium">
                  <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Waiting: {item.waitingCount}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Completed: {item.completedCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}