import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext';
import { updatePasswordSchema, deleteAccountSchema } from '../utils/validationSchemas';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updatePassword, forgotPassword, deleteAccount } = useAuth();
  const [settingsFeedback, setSettingsFeedback] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

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
        setSettingsFeedback({ type: 'success', text: res.message || 'Password updated.' });
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
    setSettingsFeedback({ type: 'success', text: 'Sending password reset link...' });
    try {
      const res = await forgotPassword(user.email);
      setSettingsFeedback({
        type: 'success',
        text: res.message || `Reset link sent to ${user.email}`,
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-md max-w-md w-full p-6 shadow-lg border border-slate-200 space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Account Settings</h3>
            <p className="text-xs text-slate-500">Manage your password and account access</p>
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
            className="text-slate-400 hover:text-slate-600 text-xs font-medium px-2 py-1"
          >
            Close
          </button>
        </div>

        {settingsFeedback.text && (
          <div
            className={`p-3 rounded text-xs font-medium ${
              settingsFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {settingsFeedback.text}
          </div>
        )}

        <form onSubmit={passwordFormik.handleSubmit} noValidate className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-700">
            Change Password
          </h4>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                value={passwordFormik.values.currentPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                className={`w-full px-3 py-2 pr-16 rounded border text-sm outline-none ${
                  passwordFormik.touched.currentPassword &&
                  passwordFormik.errors.currentPassword
                    ? 'border-red-400'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 focus:outline-none"
              >
                {showCurrentPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordFormik.touched.currentPassword &&
              passwordFormik.errors.currentPassword && (
                <p className="text-xs text-red-600 mt-1">
                  {passwordFormik.errors.currentPassword}
                </p>
              )}
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={passwordFormik.values.newPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                className={`w-full px-3 py-2 pr-16 rounded border text-sm outline-none ${
                  passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                    ? 'border-red-400'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 focus:outline-none"
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
              <p className="text-xs text-red-600 mt-1">
                {passwordFormik.errors.newPassword}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="submit"
              disabled={passwordFormik.isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded transition"
            >
              {passwordFormik.isSubmitting ? 'Saving...' : 'Update Password'}
            </button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
            >
              Send reset link to email
            </button>
          </div>
        </form>

        <div className="border-t border-slate-200 pt-5 space-y-3">
          <h4 className="text-xs font-semibold text-red-600">
            Delete Account
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Permanently remove your profile, hospital card record, and appointment history.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-medium px-3.5 py-2 rounded transition"
            >
              Delete Account
            </button>
          ) : (
            <form
              onSubmit={deleteFormik.handleSubmit}
              noValidate
              className="p-3.5 bg-red-50 border border-red-200 rounded space-y-3"
            >
              <p className="text-xs font-medium text-red-800">
                Enter your password to confirm permanent deletion:
              </p>
              <div>
                <div className="relative">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={deleteFormik.values.password}
                    onChange={deleteFormik.handleChange}
                    onBlur={deleteFormik.handleBlur}
                    className="w-full px-3 py-1.5 pr-16 rounded border border-red-300 bg-white text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 focus:outline-none"
                  >
                    {showDeletePassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {deleteFormik.touched.password && deleteFormik.errors.password && (
                  <p className="text-xs text-red-600 mt-1">
                    {deleteFormik.errors.password}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={deleteFormik.isSubmitting}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-3.5 py-1.5 rounded"
                >
                  {deleteFormik.isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    deleteFormik.resetForm();
                  }}
                  className="bg-white text-slate-600 text-xs font-medium px-3 py-1.5 rounded border border-slate-300"
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