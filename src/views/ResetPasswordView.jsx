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
        setStatus({ type: 'success', text: res.message || 'Password reset successful!' });
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
    <div className="min-h-screen bg-[#1E293B] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#0D9488] p-7 text-center text-white">
          <h1 className="text-2xl font-extrabold">Set New Password</h1>
          <p className="text-teal-100 text-xs mt-1">
            Choose a strong password for your hospital portal account
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="p-8 space-y-4">
          {status.text && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {status.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="Min. 8 characters"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 ${
                formik.touched.newPassword && formik.errors.newPassword
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-300 focus:ring-[#0D9488]'
              }`}
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="text-[11px] font-semibold text-red-600 mt-1">
                {formik.errors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-300 focus:ring-[#0D9488]'
              }`}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-[11px] font-semibold text-red-600 mt-1">
                {formik.errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-[#312E81] hover:bg-indigo-900 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow transition"
          >
            {formik.isSubmitting ? 'Updating Password...' : 'Save New Password'}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            <Link to="/login" className="text-[#0D9488] font-bold hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}