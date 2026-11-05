import React, { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import axiosClient from '../api/axiosClient';
import { onboardDoctorSchema } from '../utils/validationSchemas';

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

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      department: 'GENERAL_OPD',
      specialization: 'General Medical Officer',
      consultationRoom: 'Room 101',
      avgConsultationTimeMins: 15,
    },
    validationSchema: onboardDoctorSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setFeedback({ type: '', text: '' });
      try {
        await axiosClient.post('/admin/doctors', values);
        setFeedback({ type: 'success', text: `Onboarded Dr. ${values.fullName} successfully!` });
        resetForm();
        await fetchAdminData();
      } catch (err) {
        setFeedback({
          type: 'error',
          text: err.response?.data?.message || 'Failed to onboard doctor.',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

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
      <div className="bg-[#312E81] text-white p-6 rounded-3xl shadow-lg">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#10B981]">
          Hospital System Administration
        </span>
        <h1 className="text-2xl font-extrabold mt-1">
          Staff Onboarding & Throughput Analytics
        </h1>
      </div>

      {feedback.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboard Doctor Form */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-extrabold text-[#1E293B]">Onboard New Physician</h2>

          <form onSubmit={formik.handleSubmit} noValidate className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Dr. Full Name"
                  {...formik.getFieldProps('fullName')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-[11px] text-red-600 mt-0.5">{formik.errors.fullName}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="doctor@hospital.ng"
                  {...formik.getFieldProps('email')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-[11px] text-red-600 mt-0.5">{formik.errors.email}</p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="08012345678"
                  {...formik.getFieldProps('phone')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-[11px] text-red-600 mt-0.5">{formik.errors.phone}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Temp Password (min 8 chars)"
                  {...formik.getFieldProps('password')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-[11px] text-red-600 mt-0.5">{formik.errors.password}</p>
                )}
              </div>

              <div>
                <select
                  name="department"
                  {...formik.getFieldProps('department')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  {[
                    'GENERAL_OPD',
                    'PEDIATRICS',
                    'CARDIOLOGY',
                    'OBGYN',
                    'ORTHOPEDICS',
                    'DENTAL',
                  ].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  name="consultationRoom"
                  placeholder="Room (e.g. Room 102)"
                  {...formik.getFieldProps('consultationRoom')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-[#0D9488] hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow transition text-sm"
            >
              {formik.isSubmitting ? 'Onboarding Doctor...' : '+ Onboard Doctor'}
            </button>
          </form>
        </div>

        {/* Department Analytics */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-extrabold text-[#1E293B]">
            Today's Department Queue Metrics
          </h2>

          {analytics.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">
              No queue activity recorded for today yet.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.map((item, idx) => (
                <div
                  key={item.department || item._id || idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center"
                >
                  <div>
                    <span className="font-extrabold text-sm text-[#312E81]">
                      {item.department || item._id}
                    </span>
                    <p className="text-xs text-slate-500">
                      Total Tickets: <strong>{item.totalPatients}</strong>
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs font-bold">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                      Waiting: {item.waitingCount}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Completed: {item.completedCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Medical Staff Directory */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-lg font-extrabold text-[#1E293B]">
          Onboarded Medical Staff ({doctors.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => {
            const isAvailable = doc.doctorProfile?.isAvailableToday;
            return (
              <div
                key={doc._id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[#1E293B]">{doc.fullName}</h3>
                    <p className="text-xs text-slate-500">{doc.email}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {isAvailable ? 'ON DUTY' : 'OFF DUTY'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#312E81]">
                  {doc.doctorProfile?.department} • {doc.doctorProfile?.consultationRoom}
                </p>

                <button
                  type="button"
                  onClick={() => handleToggleAvailability(doc._id, isAvailable)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs py-2 rounded-xl transition"
                >
                  Toggle Duty Status
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}