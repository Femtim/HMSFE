import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailView() {
  const { token } = useParams();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email address...');
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const runVerification = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Your email has been verified! You may now sign in.');
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
    <div className="min-h-screen bg-[#1E293B] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden text-center p-8 space-y-6">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center text-2xl font-bold animate-pulse">
              ⏳
            </div>
            <h1 className="text-xl font-extrabold text-[#1E293B]">Verifying Email...</h1>
            <p className="text-xs text-slate-500">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center text-3xl font-extrabold">
              ✓
            </div>
            <h1 className="text-2xl font-extrabold text-[#1E293B]">Email Verified!</h1>
            <p className="text-sm text-slate-600">{message}</p>
            <Link
              to="/login"
              className="block w-full bg-[#0D9488] hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow transition"
            >
              Proceed to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl font-extrabold">
              ✕
            </div>
            <h1 className="text-2xl font-extrabold text-[#1E293B]">Verification Failed</h1>
            <p className="text-sm text-red-600">{message}</p>
            <Link
              to="/login"
              className="block w-full bg-[#312E81] hover:bg-indigo-900 text-white font-bold py-3.5 rounded-xl shadow transition"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}