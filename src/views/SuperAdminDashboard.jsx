import React, { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import axiosClient from '../api/axiosClient';
import { onboardDoctorSchema } from '../utils/validationSchemas';

export default function SuperAdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [showDocPassword, setShowDocPassword] = useState(false);

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
        setFeedback({ type: 'success', text: `Registered ${values.fullName}.` });
        resetForm();
        await fetchAdminData();
      } catch (err) {
        setFeedback({
          type: 'error',
          text: err.response?.data?.message || 'Failed to onboard clinician.',
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
      <div className="bg-white border border-slate-200 p-5 rounded-md shadow-sm">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Administration
        </span>
        <h1 className="text-lg font-semibold text-slate-900 mt-0.5">
          Staff Management & Department Throughput
        </h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Register Clinician
          </h2>

          <form onSubmit={formik.handleSubmit} noValidate className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Dr. First Last"
                  {...formik.getFieldProps('fullName')}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm outline-none focus:border-teal-600"
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-xs text-red-600 mt-0.5">{formik.errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="doctor@domain.com"
                  {...formik.getFieldProps('email')}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm outline-none focus:border-teal-600"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-red-600 mt-0.5">{formik.errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="08012345678"
                  {...formik.getFieldProps('phone')}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm outline-none focus:border-teal-600"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-xs text-red-600 mt-0.5">{formik.errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Temporary Password</label>
                <div className="relative">
                  <input
                    type={showDocPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min. 8 characters"
                    {...formik.getFieldProps('password')}
                    className="w-full px-3 py-2 pr-14 rounded border border-slate-300 text-sm outline-none focus:border-teal-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDocPassword(!showDocPassword)}
                    className="absolute inset-y-0 right-0 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    {showDocPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-red-600 mt-0.5">{formik.errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Department</label>
                <select
                  name="department"
                  {...formik.getFieldProps('department')}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
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
                <label className="block text-xs text-slate-600 mb-1">Consultation Room</label>
                <input
                  type="text"
                  name="consultationRoom"
                  placeholder="Room 102"
                  {...formik.getFieldProps('consultationRoom')}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded transition text-xs"
            >
              {formik.isSubmitting ? 'Saving...' : 'Register Clinician'}
            </button>
          </form>
        </div>

        <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Daily Queue Summary
          </h2>

          {analytics.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">
              No queue records logged today.
            </p>
          ) : (
            <div className="space-y-2.5">
              {analytics.map((item, idx) => (
                <div
                  key={item.department || item._id || idx}
                  className="p-3 rounded border border-slate-200 bg-slate-50 flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-900">
                      {item.department || item._id}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Total Checked In: <strong>{item.totalPatients}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-medium">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Waiting: {item.waitingCount}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Completed: {item.completedCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Registered Clinicians ({doctors.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => {
            const isAvailable = doc.doctorProfile?.isAvailableToday;
            return (
              <div
                key={doc._id}
                className="p-3.5 rounded border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xs text-slate-900">{doc.fullName}</h3>
                    <p className="text-[11px] text-slate-500">{doc.email}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isAvailable ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  {doc.doctorProfile?.department} · {doc.doctorProfile?.consultationRoom}
                </p>

                <button
                  type="button"
                  onClick={() => handleToggleAvailability(doc._id, isAvailable)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs py-1.5 rounded transition"
                >
                  Set {isAvailable ? 'Off Duty' : 'On Duty'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}