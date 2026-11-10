import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { useAuth } from '../context/AuthContext';
import { registerPatientSchema } from '../utils/validationSchemas';

export default function RegisterPatientView() {
  const { registerPatient, resendVerification } = useAuth();

  const [serverError, setServerError] = useState('');
  const [registeredSuccessMsg, setRegisteredSuccessMsg] = useState('');
  const [resendFeedback, setResendFeedback] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      dateOfBirth: '',
      gender: 'MALE',
      bloodGroup: 'O+',
      isVulnerable: false,
    },
    validationSchema: registerPatientSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        const res = await registerPatient(values);
        setRegisteredSuccessMsg(
          res.message || `Verification email sent to ${values.email}.`
        );
      } catch (err) {
        setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResend = async () => {
    setResendFeedback('Sending...');
    try {
      const res = await resendVerification(formik.values.email);
      setResendFeedback(res.message || 'Verification link resent.');
    } catch (err) {
      setResendFeedback(err.response?.data?.message || 'Could not resend email.');
    }
  };

  if (registeredSuccessMsg) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-slate-200 p-6 text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900">Check Your Email Inbox</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{registeredSuccessMsg}</p>

          {resendFeedback && (
            <p className="text-xs font-medium text-teal-800 bg-teal-50 p-2.5 rounded border border-teal-200">
              {resendFeedback}
            </p>
          )}

          <div className="pt-2 space-y-2">
            <Link
              to="/login"
              className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded text-xs transition"
            >
              Return to Sign In
            </Link>
            <button
              type="button"
              onClick={handleResend}
              className="text-xs text-slate-600 font-medium hover:text-slate-900 underline"
            >
              Resend verification email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4 font-sans">
      <div className="w-full max-w-xl bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-5 text-white border-b border-slate-800">
          <p className="text-xs font-medium text-teal-400 uppercase tracking-wider">
            Patient Registration
          </p>
          <h1 className="text-lg font-semibold mt-0.5">Create Hospital Card</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Register your details to book appointments and join outpatient queues
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="First and Last Name"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 rounded border text-sm outline-none ${
                  formik.touched.fullName && formik.errors.fullName
                    ? 'border-red-400'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <p className="text-xs text-red-600 mt-1">{formik.errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="08012345678"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 rounded border text-sm outline-none ${
                  formik.touched.phone && formik.errors.phone
                    ? 'border-red-400'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-xs text-red-600 mt-1">{formik.errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="patient@gmail.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 rounded border text-sm outline-none ${
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
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 pr-16 rounded border text-sm outline-none ${
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
                <p className="text-xs text-red-600 mt-1">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 rounded border text-sm outline-none ${
                  formik.touched.dateOfBirth && formik.errors.dateOfBirth
                    ? 'border-red-400'
                    : 'border-slate-300 focus:border-teal-600'
                }`}
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="text-xs text-red-600 mt-1">{formik.errors.dateOfBirth}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
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
                  value={formik.values.bloodGroup}
                  onChange={formik.handleChange}
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
              checked={formik.values.isVulnerable}
              onChange={formik.handleChange}
              className="mt-0.5 w-4 h-4 accent-teal-600"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              <strong>Priority Triage Consideration:</strong> Select if the patient is 65 or older, pregnant, or has a physical disability.
            </span>
          </label>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded text-sm transition"
          >
            {formik.isSubmitting ? 'Registering...' : 'Complete Registration'}
          </button>

          <p className="text-center text-xs text-slate-600 pt-1">
            Already registered?{' '}
            <Link to="/login" className="text-teal-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}