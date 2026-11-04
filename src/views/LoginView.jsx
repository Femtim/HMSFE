import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginView() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect automatically if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'PATIENT') navigate('/patient', { replace: true });
      else if (user.role === 'DOCTOR') navigate('/doctor', { replace: true });
      else if (user.role === 'SUPER_ADMIN') navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'PATIENT') navigate('/patient');
      else if (loggedInUser.role === 'DOCTOR') navigate('/doctor');
      else if (loggedInUser.role === 'SUPER_ADMIN') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E293B] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/20">
        {/* Header */}
        <div className="bg-[#312E81] p-8 text-center text-white">
          <span className="inline-block bg-[#10B981] text-slate-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            Intelligent Queue System
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Hospital Portal Login</h1>
          <p className="text-indigo-200 text-xs mt-1">
            Role-Based Access (Patient • Doctor • Super Admin)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@hospital.ng"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D9488] hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            New Patient?{' '}
            <Link to="/register" className="text-[#312E81] font-bold hover:underline">
              Create your Hospital Card here
            </Link>
          </p>
        </form>

        {/* Public Waiting Room TV Link */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">Waiting Area Display:</span>
          <Link
            to="/tv-board/GENERAL_OPD"
            target="_blank"
            className="text-[#0D9488] font-bold hover:underline"
          >
            Open Live TV Board ↗
          </Link>
        </div>
      </div>
    </div>
  );
}