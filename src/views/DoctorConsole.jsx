import React, { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import socket from "../api/socketClient";
import { useAuth } from "../context/AuthContext";

export default function DoctorConsole() {
  const { user } = useAuth();
  const department = user?.doctorProfile?.department || "GENERAL_OPD";

  const [activeTicket, setActiveTicket] = useState(null);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDoctorWorkspace = useCallback(async () => {
    try {
      const [activeRes, boardRes] = await Promise.all([
        axiosClient.get("/queue/doctor-active"),
        axiosClient.get(`/queue/live-board/${department}`),
      ]);
      setActiveTicket(activeRes.data.data || null);
      const allDeptTickets = boardRes.data.data || [];
      setWaitingQueue(allDeptTickets.filter((t) => t.status === "WAITING"));
    } catch (err) {
      console.error("Error loading doctor console:", err);
    }
  }, [department]);

  useEffect(() => {
    fetchDoctorWorkspace();
    socket.emit("join:department", department);

    const handleUpdate = () => fetchDoctorWorkspace();
    socket.on("queue:updated", handleUpdate);
    socket.on("queue:patient_called", handleUpdate);

    return () => {
      socket.off("queue:updated", handleUpdate);
      socket.off("queue:patient_called", handleUpdate);
    };
  }, [department, fetchDoctorWorkspace]);

  const handleCallNext = async () => {
    setLoading(true);
    setFeedback("");
    try {
      const res = await axiosClient.patch("/queue/call-next");
      setActiveTicket(res.data.data || null);
      setFeedback(res.data.message || "Queue updated.");
      await fetchDoctorWorkspace();
    } catch (err) {
      setFeedback(
        err.response?.data?.message || "Could not call next patient.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteConsultation = async (ticketId) => {
    setLoading(true);
    setFeedback("");
    try {
      await axiosClient.patch(`/queue/${ticketId}/complete`);
      setActiveTicket(null);
      setFeedback("Consultation completed.");
      await fetchDoctorWorkspace();
    } catch (err) {
      setFeedback(
        err.response?.data?.message || "Error completing consultation.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url('/image2.png')",
        backgroundSize: "100% 100%, 70% auto",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      }}
    >
      <div className="bg-teal-50 border border-slate-200 p-5 rounded-md shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Consultation Desk · {department}
          </span>
          <h1 className="text-lg font-semibold text-slate-900 mt-0.5">
            {user?.fullName}
          </h1>
          <p className="text-xs text-slate-500">
            Assigned Room:{" "}
            <strong className="text-slate-800">
              {user?.doctorProfile?.consultationRoom || "Room 101"}
            </strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleCallNext}
          disabled={loading || !!activeTicket}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-medium px-4 py-2 rounded text-xs transition"
        >
          Call Next Patient
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium rounded">
          {feedback}
        </div>
      )}

      <Outlet
        context={{
          user,
          department,
          activeTicket,
          waitingQueue,
          loading,
          onCallNext: handleCallNext,
          onCompleteConsultation: handleCompleteConsultation,
        }}
      />
    </div>
  );
}
