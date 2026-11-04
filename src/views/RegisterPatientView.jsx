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
          res.message || `Verification email sent to ${values.email}. Please check your inbox.`
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
      setResendFeedback(res.message || 'Verification link resent!');
    } catch (err) {
      setResendFeedback(err.response?.data?.message || 'Could not resend email.');
    }
  };

  if (registeredSuccessMsg) {
    return (
      <div className="min-h-screen bg-[#1E293B] flex justify-center items-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center text-3xl">
            ✉️
          </div>
          <h2 className="text-2xl font-extrabold text-[#1E293B]">Verify Your Email</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{registeredSuccessMsg}</p>

          {resendFeedback && (
            <p className="text-xs font-bold text-[#0D9488] bg-teal-50 p-2.5 rounded-xl">
              {resendFeedback}
            </p>
          )}

          <div className="pt-2 space-y-3">
            <Link
              to="/login"
              className="block w-full bg-[#0D9488] hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow transition"
            >
              Go to Login Page
            </Link>
            <button
              type="button"
              onClick={handleResend}
              className="text-xs text-[#312E81] font-bold hover:underline"
            >
              Didn't receive the email? Click to resend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E293B] flex justify-center items-center p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#0D9488] p-6 text-white text-center">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Patient Onboarding
          </span>
          <h1 className="text-2xl font-extrabold mt-2">Create Digital Hospital Card</h1>
          <p className="text-teal-100 text-xs mt-1">
            Book clinic slots online and monitor your real-time waiting queue
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="p-8 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Amina Bello"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 ${
                  formik.touched.fullName && formik.errors.fullName
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:ring-[#0D9488]'
                }`}
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">
                  {formik.errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="08012345678"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 ${
                  formik.touched.phone && formik.errors.phone
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:ring-[#0D9488]'
                }`}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">{formik.errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="amina@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:ring-[#0D9488]'
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:ring-[#0D9488]'
                }`}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 ${
                  formik.touched.dateOfBirth && formik.errors.dateOfBirth
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-300 focus:ring-[#0D9488]'
                }`}
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">
                  {formik.errors.dateOfBirth}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formik.values.bloodGroup}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
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

          <label className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              name="isVulnerable"
              checked={formik.values.isVulnerable}
              onChange={formik.handleChange}
              className="w-4 h-4 accent-[#0D9488]"
            />
            <span className="text-xs text-amber-900 font-medium">
              <strong>Priority Queue Eligibility:</strong> Check if you are elderly (65+), pregnant,
              or have a physical disability.
            </span>
          </label>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-[#0D9488] hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow transition"
          >
            {formik.isSubmitting ? 'Creating Account & Sending Email...' : 'Complete Registration'}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Already have a Hospital Card?{' '}
            <Link to="/login" className="text-[#312E81] font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}