import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext';
import { resetPasswordSchema } from '../utils/validationSchemas';

export default function ResetPasswordView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [status, setStatus] = useState({ type: '', text: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setStatus({ type: '', text: '' });
      try {
        const res = await resetPassword(token, values.newPassword);
        setStatus({ type: 'success', text: res.message || 'Password updated.' });
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setStatus({
          type: 'error',
          text: err.response?.data?.message || 'Reset link is invalid or expired.',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-5 text-white border-b border-slate-800">
          <h1 className="text-base font-semibold">Set New Password</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Enter a new password for your account
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="p-6 space-y-4">
          {status.text && (
            <div
              className={`p-3 rounded text-xs font-medium ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {status.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                placeholder="Minimum 8 characters"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 pr-16 rounded border text-sm outline-none ${
                  formik.touched.newPassword && formik.errors.newPassword
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
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="text-xs text-red-600 mt-1">
                {formik.errors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 pr-16 rounded border text-sm outline-none ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-400'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 focus:outline-none"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                {formik.errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded text-sm transition"
          >
            {formik.isSubmitting ? 'Saving...' : 'Save Password'}
          </button>

          <p className="text-center text-xs text-slate-600 pt-1">
            <Link to="/login" className="text-teal-600 font-medium hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}