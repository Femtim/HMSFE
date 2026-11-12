import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useAuth } from '../../context/AuthContext';
import {
  updatePatientProfileSchema,
  updatePasswordSchema,
  deleteAccountSchema,
} from '../../utils/validationSchemas';

export default function PatientProfileTab() {
  const { user, updateProfile, updatePassword, forgotPassword, deleteAccount } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ type: '', text: '' });
  const [settingsFeedback, setSettingsFeedback] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const cardNumber =
    user?.hospitalCardNumber || user?.patientProfile?.hospitalCardNumber || 'N/A';

  const formattedDob = user?.patientProfile?.dateOfBirth
    ? new Date(user.patientProfile.dateOfBirth).toISOString().split('T')[0]
    : '';

  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      dateOfBirth: formattedDob,
      gender: user?.patientProfile?.gender || 'MALE',
      bloodGroup: user?.patientProfile?.bloodGroup || 'O+',
      isVulnerable: Boolean(user?.patientProfile?.isVulnerable),
    },
    validationSchema: updatePatientProfileSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setProfileFeedback({ type: '', text: '' });
      try {
        const res = await updateProfile(values);
        setProfileFeedback({
          type: 'success',
          text: res.message || 'Profile updated.',
        });
        setIsEditingProfile(false);
      } catch (err) {
        setProfileFeedback({
          type: 'error',
          text: err.response?.data?.message || 'Failed to update profile.',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Patient Profile & Triage</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered hospital card, contact, and clinical priority details
            </p>
          </div>
          {!isEditingProfile ? (
            <button
              type="button"
              onClick={() => {
                setProfileFeedback({ type: '', text: '' });
                setIsEditingProfile(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded transition"
            >
              Edit Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                profileFormik.resetForm();
                setIsEditingProfile(false);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded transition"
            >
              Cancel
            </button>
          )}
        </div>

        {profileFeedback.text && (
          <div
            className={`p-3 rounded text-xs font-medium ${
              profileFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {profileFeedback.text}
          </div>
        )}

        {!isEditingProfile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Full Name</span>
              <strong className="text-slate-900 text-sm">{user?.fullName}</strong>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Hospital Card Number</span>
              <strong className="text-slate-900 text-sm font-mono">{cardNumber}</strong>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Email Address</span>
              <strong className="text-slate-900">{user?.email}</strong>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Phone Number</span>
              <strong className="text-slate-900">{user?.phone || 'N/A'}</strong>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Date of Birth</span>
              <strong className="text-slate-900">{formattedDob || 'Not specified'}</strong>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Gender</span>
              <strong className="text-slate-900">{user?.patientProfile?.gender || 'MALE'}</strong>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Blood Group</span>
              <strong className="text-slate-900">
                {user?.patientProfile?.bloodGroup || 'O+'}
              </strong>
            </div>
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Triage Priority</span>
              <strong className="text-slate-900">
                {user?.patientProfile?.isVulnerable ? 'Vulnerable (Priority)' : 'Routine'}
              </strong>
            </div>
          </div>
        ) : (
          <form onSubmit={profileFormik.handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileFormik.values.fullName}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  className={`w-full px-3 py-2 rounded border text-sm outline-none ${
                    profileFormik.touched.fullName && profileFormik.errors.fullName
                      ? 'border-red-400'
                      : 'border-slate-300 focus:border-teal-600'
                  }`}
                />
                {profileFormik.touched.fullName && profileFormik.errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{profileFormik.errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileFormik.values.phone}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  className={`w-full px-3 py-2 rounded border text-sm outline-none ${
                    profileFormik.touched.phone && profileFormik.errors.phone
                      ? 'border-red-400'
                      : 'border-slate-300 focus:border-teal-600'
                  }`}
                />
                {profileFormik.touched.phone && profileFormik.errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{profileFormik.errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profileFormik.values.dateOfBirth}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  className={`w-full px-3 py-2 rounded border text-sm outline-none ${
                    profileFormik.touched.dateOfBirth && profileFormik.errors.dateOfBirth
                      ? 'border-red-400'
                      : 'border-slate-300 focus:border-teal-600'
                  }`}
                />
                {profileFormik.touched.dateOfBirth && profileFormik.errors.dateOfBirth && (
                  <p className="text-xs text-red-600 mt-1">{profileFormik.errors.dateOfBirth}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profileFormik.values.gender}
                    onChange={profileFormik.handleChange}
                    className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={profileFormik.values.bloodGroup}
                    onChange={profileFormik.handleChange}
                    className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded cursor-pointer">
              <input
                type="checkbox"
                name="isVulnerable"
                checked={profileFormik.values.isVulnerable}
                onChange={profileFormik.handleChange}
                className="mt-0.5 w-4 h-4 accent-teal-600"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong>Priority Triage Consideration:</strong> Select if the patient is 65 or
                older, pregnant, or has a physical disability.
              </span>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={profileFormik.isSubmitting}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded transition"
              >
                {profileFormik.isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  profileFormik.resetForm();
                  setIsEditingProfile(false);
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-4 py-2 rounded border border-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-slate-900">Account Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your password or manage account security
          </p>
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
          <h4 className="text-xs font-semibold text-slate-700">Change Password</h4>
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
                className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800"
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
                className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800"
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
          <h4 className="text-xs font-semibold text-red-600">Delete Account</h4>
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
                    className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800"
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