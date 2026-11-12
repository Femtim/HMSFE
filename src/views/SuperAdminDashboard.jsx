import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function SuperAdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchAdminData = useCallback(async () => {
    try {
      const [docsRes, analyticsRes] = await Promise.all([
        axiosClient.get('/admin/doctors'),
        axiosClient.get('/admin/analytics'),
      ]);
      setDoctors(docsRes.data.data || []);
      setAnalytics(analyticsRes.data.analytics || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleToggleAvailability = async (doctorId, currentStatus) => {
    try {
      await axiosClient.patch(`/admin/doctors/${doctorId}/availability`, {
        isAvailableToday: !currentStatus,
      });
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-teal-50 border border-slate-200 p-5 rounded-md shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Administration
          </span>
          <h1 className="text-lg font-semibold text-slate-900 mt-0.5">
            Staff Management & Department Throughput
          </h1>
        </div>
        <div className="flex gap-4 text-xs text-slate-600">
          <span>
            Registered Clinicians: <strong className="text-slate-900 font-mono">{doctors.length}</strong>
          </span>
          <span>
            Active Units Today: <strong className="text-slate-900 font-mono">{analytics.length}</strong>
          </span>
        </div>
      </div>

      {feedback.text && (
        <div
          className={`p-3 rounded text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <Outlet
        context={{
          doctors,
          analytics,
          feedback,
          setFeedback,
          fetchAdminData,
          onToggleAvailability: handleToggleAvailability,
        }}
      />
    </div>
  );
}