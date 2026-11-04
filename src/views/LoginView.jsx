import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../utils/validationSchemas";

export default function LoginView() {
  const { login, resendVerification, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "PATIENT") navigate("/patient", { replace: true });
      else if (user.role === "DOCTOR") navigate("/doctor", { replace: true });
      else if (user.role === "SUPER_ADMIN")
        navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      setResendStatus("");
      setUnverifiedEmail("");

      try {
        const loggedInUser = await login(values.email, values.password);
        if (loggedInUser.role === "PATIENT") navigate("/patient");
        else if (loggedInUser.role === "DOCTOR") navigate("/doctor");
        else if (loggedInUser.role === "SUPER_ADMIN") navigate("/admin");
      } catch (err) {
        const data = err.response?.data;
        setServerError(data?.message || "Invalid email or password.");
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
    setResendStatus("Sending new verification email...");
    try {
      const res = await resendVerification(unverifiedEmail);
      setResendStatus(
        res.message || "Verification link sent! Please check your inbox.",
      );
    } catch (err) {
      setResendStatus(
        err.response?.data?.message || "Failed to resend verification email.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#1E293B] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/20">
        <div className="bg-[#312E81] p-8 text-center text-white">
          <span className="inline-block bg-[#10B981] text-slate-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            Intelligent Queue System
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Hospital Portal Login
          </h1>
          <p className="text-indigo-200 text-xs mt-1">
            Role-Based Access (Patient • Doctor • Super Admin)
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="p-8 space-y-5"
        >
          {serverError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl space-y-2">
              <p>{serverError}</p>
              {unverifiedEmail && (
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          )}

          {resendStatus && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-xl">
              {resendStatus}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@hospital.ng"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-300 focus:ring-[#0D9488]"
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-[11px] font-semibold text-red-600 mt-1">
                {formik.errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase text-slate-500">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-[#0D9488] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-300 focus:ring-[#0D9488]"
              }`}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-[11px] font-semibold text-red-600 mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-[#0D9488] hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md transition"
          >
            {formik.isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            New Patient?{" "}
            <Link
              to="/register"
              className="text-[#312E81] font-bold hover:underline"
            >
              Create your acoount here
            </Link>
          </p>
        </form>

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
