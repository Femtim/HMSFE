import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext';
import { updatePasswordSchema, deleteAccountSchema } from '../utils/validationSchemas';

const DEPARTMENTS = [
  'GENERAL_OPD',
  'PEDIATRICS',
  'CARDIOLOGY',
  'OBGYN',
  'ORTHOPEDICS',
  'DENTAL',
];

export default function DashboardLayout({ children }) {
  const { user, logout, updatePassword, forgotPassword, deleteAccount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tvDepartment, setTvDepartment] = useState(
    user?.doctorProfile?.department || 'GENERAL_OPD'
  );
  const [activeModal, setActiveModal] = useState(null); // 'info' | 'settings' | null
  const [selectedNavSection, setSelectedNavSection] = useState('dashboard');
  const [settingsFeedback, setSettingsFeedback] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const cardNumber =
    user?.hospitalCardNumber || user?.patientProfile?.hospitalCardNumber || 'STAFF-ID';

  const roleNavigation = {
    PATIENT: [
      { id: 'dashboard', label: 'Appointments & Check-In', icon: '📅' },
      { id: 'queue', label: 'Live Queue Tracker', icon: '⏳' },
      { id: 'card', label: 'Medical Card & Vitals', icon: '🪪' },
      { id: 'departments', label: 'Clinic Units & Hours', icon: '🏥' },
    ],
    DOCTOR: [
      { id: 'dashboard', label: 'Consultation Console', icon: '🩺' },
      { id: 'triage', label: 'Priority Triage Rules', icon: '🚨' },
      { id: 'schedule', label: 'Clinic Shift & Room Info', icon: '🕒' },
    ],
    SUPER_ADMIN: [
      { id: 'dashboard', label: 'Staff & Command Center', icon: '🛡️' },
      { id: 'analytics', label: 'Department Bottlenecks', icon: '📊' },
      { id: 'directory', label: 'Medical Directory', icon: '👨‍⚕️' },
    ],
  };

  const navItems = roleNavigation[user?.role] || roleNavigation.PATIENT;

  // Formik for Password Update in Settings
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
    },
    validationSchema: updatePasswordSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSettingsFeedback({ type: '', text: '' });
      try {
        const res = await updatePassword(values.currentPassword, values.newPassword);
        setSettingsFeedback({ type: 'success', text: res.message || 'Password updated!' });
        resetForm();
      } catch (err) {
        setSettingsFeedback({
          type: 'error',
          text: err.response?.data?.message || 'Failed to update password.',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Formik for Permanent Account Deletion in Settings
  const deleteFormik = useFormik({
    initialValues: {
      password: '',
    },
    validationSchema: deleteAccountSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSettingsFeedback({ type: '', text: '' });
      try {
        await deleteAccount(values.password);
      } catch (err) {
        setSettingsFeedback({
          type: 'error',
          text: err.response?.data?.message || 'Could not delete account.',
        });
        setSubmitting(false);
      }
    },
  });

  const handleSendResetEmail = async () => {
    setSettingsFeedback({ type: 'success', text: 'Sending reset link...' });
    try {
      const res = await forgotPassword(user.email);
      setSettingsFeedback({
        type: 'success',
        text: res.message || `Password reset link sent to ${user.email}`,
      });
    } catch (err) {
      setSettingsFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Could not send reset email.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* TOP HOSPITAL NAVBAR */}
      <nav className="sticky top-0 z-30 bg-[#1E293B] text-white border-b border-slate-700/80 px-4 lg:px-8 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
            aria-label="Toggle Menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0D9488] flex items-center justify-center font-black text-lg shadow-inner">
              H
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-sm sm:text-base block leading-none">
                HAQMS NIGERIA
              </span>
              <span className="text-[10px] text-[#10B981] font-bold uppercase tracking-widest">
                Intelligent Hospital Portal
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-1 pl-3 gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[11px] font-bold text-slate-300 uppercase">TV Screen:</span>
            <select
              value={tvDepartment}
              onChange={(e) => setTvDepartment(e.target.value)}
              className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#10B981]"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept.replace('_', ' ')}
                </option>
              ))}
            </select>
            <Link
              to={`/tv-board/${tvDepartment}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0D9488] hover:bg-teal-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow"
            >
              <span>📺 Open TV Board</span>
              <span>↗</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setSettingsFeedback({ type: '', text: '' });
              setActiveModal('settings');
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Settings</span>
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-700">
            <div className="w-8 h-8 rounded-full bg-[#312E81] border border-indigo-400/40 flex items-center justify-center font-bold text-xs uppercase">
              {user?.fullName?.slice(0, 2) || 'US'}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[120px]">
                {user?.fullName}
              </p>
              <p className="text-[10px] font-bold text-[#10B981] uppercase">{user?.role}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* BODY CONTAINER: SIDEBAR + EXISTING VIEW */}
      <div className="flex-1 flex relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:static inset-y-0 left-0 z-20 w-72 bg-[#1E293B] text-slate-200 border-r border-slate-700/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-5 space-y-6 overflow-y-auto">
            <div className="bg-gradient-to-br from-[#312E81] to-slate-900 p-4 rounded-2xl border border-indigo-500/30 shadow-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#10B981] text-slate-900">
                  {user?.role} PORTAL
                </span>
                <span className="text-[11px] font-mono text-indigo-200">{cardNumber}</span>
              </div>
              <h3 className="font-bold text-white text-sm truncate">{user?.fullName}</h3>
              <p className="text-xs text-indigo-200 truncate">{user?.email}</p>

              {user?.role === 'PATIENT' && (
                <div className="pt-2 border-t border-indigo-500/30 flex justify-between text-[11px] text-indigo-100">
                  <span>
                    Blood: <strong>{user?.patientProfile?.bloodGroup || 'O+'}</strong>
                  </span>
                  <span>
                    Triage:{' '}
                    <strong>
                      {user?.patientProfile?.isVulnerable ? 'VULNERABLE' : 'ROUTINE'}
                    </strong>
                  </span>
                </div>
              )}

              {user?.role === 'DOCTOR' && (
                <div className="pt-2 border-t border-indigo-500/30 flex justify-between text-[11px] text-indigo-100">
                  <span>
                    Dept: <strong>{user?.doctorProfile?.department || 'OPD'}</strong>
                  </span>
                  <span>
                    Room: <strong>{user?.doctorProfile?.consultationRoom || '101'}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
                Hospital Navigation
              </p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedNavSection(item.id);
                    if (item.id !== 'dashboard') {
                      setActiveModal('info');
                    }
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    selectedNavSection === item.id
                      ? 'bg-[#0D9488] text-white shadow'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  📺 Hallway TV Screen
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-[#10B981] font-bold px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Launch the public waiting room display board for any hospital department:
              </p>
              <select
                value={tvDepartment}
                onChange={(e) => setTvDepartment(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <Link
                to={`/tv-board/${tvDepartment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-[#312E81] hover:bg-indigo-800 text-white text-xs font-bold py-2.5 rounded-xl shadow transition"
              >
                Launch Live TV Display ↗
              </Link>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 space-y-2.5 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#10B981]">
                🏥 Hospital Directory & Hours
              </p>
              <div className="text-slate-300 space-y-1 text-[11px]">
                <p>
                  <strong>OPD Clinic Hours:</strong> Mon–Fri (08:00 – 16:00)
                </p>
                <p>
                  <strong>Emergency & Casualty:</strong> 24/7 Open
                </p>
                <p>
                  <strong>Ambulance Hotline:</strong>{' '}
                  <span className="text-emerald-400 font-mono">112 / +234-800-HAQMS</span>
                </p>
                <p>
                  <strong>NHIS & Records Desk:</strong> Ground Floor, Wing A
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-700/80 bg-slate-900/60 space-y-2">
            <button
              type="button"
              onClick={() => {
                setSettingsFeedback({ type: '', text: '' });
                setActiveModal('settings');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 transition"
            >
              <span className="flex items-center gap-2">⚙️ Account & Security Settings</span>
              <span>›</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold py-2.5 rounded-xl border border-red-500/30 transition"
            >
              Sign Out of Portal
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>

      {/* MODAL 1: HOSPITAL DETAILS / VITALS / TRIAGE INFO */}
      {activeModal === 'info' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-extrabold text-[#1E293B]">
                Hospital Information & Clinical Guide
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedNavSection('dashboard');
                }}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-[#312E81] block mb-1">
                  🪪 Digital Hospital Card & Verification
                </strong>
                Present your Hospital Card Number (<strong>{cardNumber}</strong>) at the Triage
                or Pharmacy unit. Your queue position is synchronized automatically across all
                hallway TV boards.
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                <strong className="block mb-1">🚨 Priority Queue Triage Rules</strong>
                HAQMS automatically prioritizes patients in three tiers:
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li>
                    <strong>Weight 3 (Emergency):</strong> Immediate life-saving intervention.
                  </li>
                  <li>
                    <strong>Weight 2 (Vulnerable):</strong> Elderly (65+), pregnant women, &
                    physically challenged patients.
                  </li>
                  <li>
                    <strong>Weight 1 (Routine):</strong> Standard first-in, first-out (FIFO)
                    outpatient queue.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-[#1E293B] block mb-1">
                  🏥 Active Clinical Departments
                </strong>
                General OPD • Pediatrics • Cardiology • Obstetrics & Gynecology (OBGYN) •
                Orthopedics • Dental Clinic.
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                setSelectedNavSection('dashboard');
              }}
              className="w-full bg-[#312E81] text-white font-bold py-3 rounded-xl text-xs"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: SETTINGS (FORMIK + YUP PASSWORD RESET & ACCOUNT DELETION) */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D9488]">
                  Security & Profile
                </span>
                <h3 className="text-xl font-extrabold text-[#1E293B]">Account Settings</h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setShowDeleteConfirm(false);
                  passwordFormik.resetForm();
                  deleteFormik.resetForm();
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {settingsFeedback.text && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold ${
                  settingsFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {settingsFeedback.text}
              </div>
            )}

            {/* Section A: Update Password with Formik & Yup */}
            <form onSubmit={passwordFormik.handleSubmit} noValidate className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-slate-500">
                1. Change / Reset Password
              </h4>
              <div>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current Password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    passwordFormik.touched.currentPassword &&
                    passwordFormik.errors.currentPassword
                      ? 'border-red-400'
                      : 'border-slate-300'
                  }`}
                />
                {passwordFormik.touched.currentPassword &&
                  passwordFormik.errors.currentPassword && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">
                      {passwordFormik.errors.currentPassword}
                    </p>
                  )}
              </div>

              <div>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password (Min. 8 characters)"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                    passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                      ? 'border-red-400'
                      : 'border-slate-300'
                  }`}
                />
                {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                  <p className="text-[11px] font-semibold text-red-600 mt-1">
                    {passwordFormik.errors.newPassword}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="submit"
                  disabled={passwordFormik.isSubmitting}
                  className="bg-[#0D9488] hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition"
                >
                  {passwordFormik.isSubmitting ? 'Updating...' : 'Update Password'}
                </button>

                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  className="text-xs font-bold text-[#312E81] hover:underline"
                >
                  Forgot current password? Email me a reset link
                </button>
              </div>
            </form>

            {/* Section B: Danger Zone - Delete Account with Formik & Yup */}
            <div className="border-t pt-5 space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-red-600">
                2. Danger Zone — Delete Hospital Account
              </h4>
              <p className="text-xs text-slate-500">
                Permanently remove your hospital profile, card number, and personal records.
                This action cannot be undone.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  Delete My Account...
                </button>
              ) : (
                <form
                  onSubmit={deleteFormik.handleSubmit}
                  noValidate
                  className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3"
                >
                  <p className="text-xs font-bold text-red-800">
                    Enter your password to confirm permanent account deletion:
                  </p>
                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Confirm your password"
                      value={deleteFormik.values.password}
                      onChange={deleteFormik.handleChange}
                      onBlur={deleteFormik.handleBlur}
                      className="w-full px-3.5 py-2 rounded-xl border border-red-300 bg-white text-sm outline-none"
                    />
                    {deleteFormik.touched.password && deleteFormik.errors.password && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1">
                        {deleteFormik.errors.password}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={deleteFormik.isSubmitting}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shadow"
                    >
                      {deleteFormik.isSubmitting ? 'Deleting...' : 'Confirm Permanent Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        deleteFormik.resetForm();
                      }}
                      className="bg-white text-slate-600 text-xs font-bold px-3 py-2 rounded-xl border"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}