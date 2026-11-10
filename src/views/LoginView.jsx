import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validationSchemas';

export default function LoginView() {
  const { login, resendVerification, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'PATIENT') navigate('/patient', { replace: true });
      else if (user.role === 'DOCTOR') navigate('/doctor', { replace: true });
      else if (user.role === 'SUPER_ADMIN') navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      setResendStatus('');
      setUnverifiedEmail('');

      try {
        const loggedInUser = await login(values.email, values.password);
        if (loggedInUser.role === 'PATIENT') navigate('/patient');
        else if (loggedInUser.role === 'DOCTOR') navigate('/doctor');
        else if (loggedInUser.role === 'SUPER_ADMIN') navigate('/admin');
      } catch (err) {
        const data = err.response?.data;
        setServerError(data?.message || 'Invalid email or password.');
        if (data?.requiresVerification) {
          setUnverifiedEmail(data.email || values.email);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResendEmail = async () => {
    if (!unverifiedEmail) return;
    setResendStatus('Sending verification email...');
    try {
      const res = await resendVerification(unverifiedEmail);
      setResendStatus(res.message || 'Verification link sent. Please check your inbox.');
    } catch (err) {
      setResendStatus(err.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-5 text-white border-b border-slate-800">
          <p className="text-xs font-medium text-teal-400 uppercase tracking-wider">
            GENERAL HOSPITAL
          </p>
          <h1 className="text-lg font-semibold mt-0.5">Sign in to your account</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Access outpatient appointments, clinical queues, and administrative tools
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded space-y-2">
              <p className="break-all">{serverError}</p>
              {unverifiedEmail && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium px-2.5 py-1 rounded text-xs transition"
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          )}

          {resendStatus && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded break-all">
              {resendStatus}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@gmail.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 rounded border text-slate-900 text-sm outline-none ${
                formik.touched.email && formik.errors.email
                  ? 'border-red-400'
                  : 'border-slate-300 focus:border-teal-600'
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-600 mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-teal-600 hover:text-teal-700"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 pr-16 rounded border text-slate-900 text-sm outline-none ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-400'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 focus:outline-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded text-sm transition"
          >
            {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-slate-600 pt-1">
            New patient?{' '}
            <Link to="/register" className="text-teal-600 font-medium hover:underline">
              Register an account
            </Link>
          </p>
        </form>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">Public Queue Monitor</span>
          <Link
            to="/tv-board/GENERAL_OPD"
            target="_blank"
            className="text-slate-700 font-medium hover:text-teal-600"
          >
            View Live Board
          </Link>
        </div>
      </div>
    </div>
  );
}