import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const DEPARTMENTS = ['GENERAL_OPD', 'PEDIATRICS', 'CARDIOLOGY', 'OBGYN', 'ORTHOPEDICS', 'DENTAL'];

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    department: 'GENERAL_OPD',
    specialization: '',
    consultationRoom: '',
    avgConsultationTimeMins: 15,
  });

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, doctorsRes] = await Promise.all([
        axiosClient.get('/admin/analytics'),
        axiosClient.get('/admin/doctors'),
      ]);
      setAnalytics(analyticsRes.data.analytics || []);
      setDoctors(doctorsRes.data.data || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDoctorInput = (e) => {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnboardDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await axiosClient.post('/admin/doctors', {
        ...doctorForm,
        avgConsultationTimeMins: Number(doctorForm.avgConsultationTimeMins),
      });

      setStatusMsg({
        type: 'success',
        text: `${doctorForm.fullName} onboarded to ${doctorForm.department} successfully!`,
      });

      setDoctorForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        department: 'GENERAL_OPD',
        specialization: '',
        consultationRoom: '',
        avgConsultationTimeMins: 15,
      });

      fetchDashboardData();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to onboard doctor.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center bg-[#1E293B] text-white p-6 rounded-2xl shadow-md gap-4">
          <div>
            <span className="bg-[#10B981] text-slate-900 font-bold text-xs px-3 py-1 rounded-full uppercase">
              SUPER_ADMIN • {user?.fullName}
            </span>
            <h1 className="text-2xl font-bold mt-2">Hospital Command & Staff Management</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Onboard medical doctors and evaluate real-time department waiting bottlenecks
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-slate-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            Sign Out
          </button>
        </header>

        {/* Top Grid: Add Doctor Form + Active Doctors Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-[#312E81] border-b pb-3 mb-4">
              + Onboard New Doctor
            </h2>

            {statusMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs font-medium mb-4 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleOnboardDoctor} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={doctorForm.fullName}
                  onChange={handleDoctorInput}
                  placeholder="e.g. Dr. Chika Nwosu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Work Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={doctorForm.email}
                    onChange={handleDoctorInput}
                    placeholder="dr.chika@hospital.ng"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={doctorForm.phone}
                    onChange={handleDoctorInput}
                    placeholder="+2348030000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Department</label>
                  <select
                    name="department"
                    value={doctorForm.department}
                    onChange={handleDoctorInput}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    required
                    value={doctorForm.specialization}
                    onChange={handleDoctorInput}
                    placeholder="e.g. Family Medicine"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Consultation Room</label>
                  <input
                    type="text"
                    name="consultationRoom"
                    required
                    value={doctorForm.consultationRoom}
                    onChange={handleDoctorInput}
                    placeholder="Room 102 - OPD"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Slot Duration (Mins)</label>
                  <input
                    type="number"
                    name="avgConsultationTimeMins"
                    min={5}
                    max={60}
                    required
                    value={doctorForm.avgConsultationTimeMins}
                    onChange={handleDoctorInput}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Assign Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={doctorForm.password}
                  onChange={handleDoctorInput}
                  placeholder="Min. 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#312E81] hover:bg-indigo-900 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow transition"
              >
                {loading ? 'Onboarding Doctor...' : 'Create Doctor Account'}
              </button>
            </form>
          </div>

          {/* Registered Doctors Table */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-lg font-bold text-[#1E293B]">Onboarded Hospital Doctors</h2>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                {doctors.length} Active
              </span>
            </div>

            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Room</th>
                    <th className="p-3">Slot Interval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doctors.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <strong className="block text-slate-800">{doc.fullName}</strong>
                        <span className="text-xs text-slate-400">{doc.email}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-indigo-50 text-[#312E81] text-xs font-bold px-2.5 py-1 rounded-full">
                          {doc.doctorProfile?.department}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{doc.doctorProfile?.consultationRoom}</td>
                      <td className="p-3 text-slate-500">{doc.doctorProfile?.avgConsultationTimeMins} mins</td>
                    </tr>
                  ))}
                  {doctors.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-400">
                        No doctors registered yet. Use the form on the left to add doctors.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Department Flow & Bottleneck Analytics */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1E293B]">
            Real-Time Department Queue & Waiting Time Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.map((dept) => (
              <div
                key={dept.department}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4"
              >
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-base text-[#312E81]">{dept.department}</h3>
                  <span className="text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
                    Total Tickets: {dept.totalPatients}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 text-xs block">Avg Wait Time</span>
                    <strong className="text-xl text-amber-600">{dept.avgWaitTimeMins}m</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 text-xs block">Avg Consult Time</span>
                    <strong className="text-xl text-[#0D9488]">{dept.avgConsultationMins}m</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 text-xs block">Waiting Now</span>
                    <strong className="text-lg">{dept.waitingCount}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-slate-400 text-xs block">Completed</span>
                    <strong className="text-lg text-[#10B981]">{dept.completedCount}</strong>
                  </div>
                </div>
              </div>
            ))}
            {analytics.length === 0 && (
              <div className="col-span-3 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
                No queue activity recorded for today yet. Analytics will populate automatically as patients check in.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}