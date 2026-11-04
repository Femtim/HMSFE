import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext';
import { forgotPasswordSchema } from '../utils/validationSchemas';

export default function ForgotPasswordView() {
  const { forgotPassword } = useAuth();
  const [status, setStatus] = useState({ type: '', text: '' });

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setStatus({ type: '', text: '' });
      try {
        const res = await forgotPassword(values.email);
        setStatus({
          type: 'success',
          text: res.message || 'Password reset link sent! Check your email inbox.',
        });
      } catch (err) {
        setStatus({
          type: 'error',
          text: err.response?.data?.message || 'Could not send reset email.',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#1E293B] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#312E81] p-7 text-center text-white">
          <h1 className="text-2xl font-extrabold">Forgot Your Password?</h1>
          <p className="text-indigo-200 text-xs mt-1">
            Enter your registered email to receive a password reset link
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="p-8 space-y-5">
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
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Registered Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@hospital.ng"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 ${
                formik.touched.email && formik.errors.email
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-300 focus:ring-[#0D9488]'
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-[11px] font-semibold text-red-600 mt-1">{formik.errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-[#0D9488] hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow transition"
          >
            {formik.isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Remembered your password?{' '}
            <Link to="/login" className="text-[#312E81] font-bold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}