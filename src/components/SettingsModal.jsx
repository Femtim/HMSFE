import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext';
import { updatePasswordSchema, deleteAccountSchema } from '../utils/validationSchemas';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updatePassword, forgotPassword, deleteAccount } = useAuth();
  const [settingsFeedback, setSettingsFeedback] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  if (!isOpen) return null;

  return (
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
            type="button"
            onClick={() => {
              setShowDeleteConfirm(false);
              setSettingsFeedback({ type: '', text: '' });
              passwordFormik.resetForm();
              deleteFormik.resetForm();
              onClose();
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

        {/* Section A: Update Password */}
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
                passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                  ? 'border-red-400'
                  : 'border-slate-300'
              }`}
            />
            {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
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

        {/* Section B: Danger Zone — Delete Account */}
        <div className="border-t pt-5 space-y-3">
          <h4 className="text-xs font-extrabold uppercase text-red-600">
            2. Danger Zone — Delete Hospital Account
          </h4>
          <p className="text-xs text-slate-500">
            Permanently remove your hospital profile, card number, and personal records. This
            action cannot be undone.
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
  );
}