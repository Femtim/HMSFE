import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailView() {
  const { token } = useParams();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email address...');
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const runVerification = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Your email has been verified. You may now sign in.');
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
            'Verification link is invalid or has expired. Please request a new link from the login page.'
        );
      }
    };

    if (token) {
      runVerification();
    } else {
      setStatus('error');
      setMessage('Missing verification token.');
    }
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-slate-200 text-center p-6 space-y-4">
        {status === 'verifying' && (
          <>
            <h1 className="text-base font-semibold text-slate-900">Verifying Email</h1>
            <p className="text-xs text-slate-500">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-base font-semibold text-slate-900">Email Verified</h1>
            <p className="text-xs text-slate-600">{message}</p>
            <Link
              to="/login"
              className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded text-xs transition"
            >
              Continue to Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-10 h-10 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-base font-semibold text-slate-900">Verification Failed</h1>
            <p className="text-xs text-red-600">{message}</p>
            <Link
              to="/login"
              className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded text-xs transition"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}