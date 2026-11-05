import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import socket from '../api/socketClient';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  { id: 'GENERAL_OPD', label: 'General OPD' },
  { id: 'PEDIATRICS', label: 'Pediatrics' },
  { id: 'CARDIOLOGY', label: 'Cardiology' },
  { id: 'OBGYN', label: 'Obstetrics & Gynecology' },
  { id: 'ORTHOPEDICS', label: 'Orthopedics' },
  { id: 'DENTAL', label: 'Dental Clinic' },
];

export default function PatientPortal() {
  const { user } = useAuth();

  const [department, setDepartment] = useState('GENERAL_OPD');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptomsOrReason, setSymptomsOrReason] = useState('');

  const [myAppointments, setMyAppointments] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const fetchMyData = useCallback(async () => {
    try {
      const [aptRes, ticketRes] = await Promise.all([
        axiosClient.get('/appointments/my-appointments'),
        axiosClient.get('/queue/my-active-ticket'),
      ]);
      setMyAppointments(aptRes.data.data || []);
      const ticketData = ticketRes.data.data || null;
      setActiveTicket(ticketData);

      if (ticketData?.department) {
        socket.emit('join:department', ticketData.department);
      }
    } catch (err) {
      console.error('Error loading patient data:', err);
    }
  }, []);

  useEffect(() => {
    fetchMyData();
  }, [fetchMyData]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosClient.get(`/appointments/doctors?department=${department}`);
        const list = res.data.data || [];
        setDoctors(list);
        setSelectedDoctor(list[0]?._id || '');
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, [department]);

  useEffect(() => {
    if (!selectedDoctor || !appointmentDate) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlots = async () => {
      try {
        const res = await axiosClient.get(
          `/appointments/slots?doctorId=${selectedDoctor}&date=${appointmentDate}`
        );
        setAvailableSlots(res.data.availableSlots || []);
        setSelectedSlot(null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSlots();
  }, [selectedDoctor, appointmentDate]);

  useEffect(() => {
    const handleQueueRefresh = () => fetchMyData();
    socket.on('queue:updated', handleQueueRefresh);
    socket.on('queue:patient_called', handleQueueRefresh);
    return () => {
      socket.off('queue:updated', handleQueueRefresh);
      socket.off('queue:patient_called', handleQueueRefresh);
    };
  }, [fetchMyData]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedSlot) {
      setFeedback({ type: 'error', text: 'Please select a doctor and an available time slot.' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', text: '' });
    try {
      await axiosClient.post('/appointments/book', {
        doctorId: selectedDoctor,
        appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        symptomsOrReason,
      });
      setFeedback({ type: 'success', text: 'Appointment booked! You can now check in below.' });
      setSymptomsOrReason('');
      setSelectedSlot(null);
      await fetchMyData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Booking failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentReference) => {
    setFeedback({ type: '', text: '' });
    try {
      await axiosClient.post('/queue/check-in', { appointmentReference });
      setFeedback({
        type: 'success',
        text: 'Checked into live hospital queue! Your ticket is active.',
      });
      await fetchMyData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Check-in failed.',
      });
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await axiosClient.patch(`/appointments/${appointmentId}/cancel`, {
        cancellationReason: 'Cancelled by patient via portal',
      });
      await fetchMyData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Cancellation failed.',
      });
    }
  };

  const ticketNumber = activeTicket?.ticketNumber;
  const ticketRoom = activeTicket?.consultationRoom;
  const ticketDoctor =
    typeof activeTicket?.doctor === 'string'
      ? activeTicket.doctor
      : activeTicket?.doctorId?.fullName || 'Assigned Doctor';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#312E81] text-white p-6 rounded-3xl shadow-lg flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#10B981]">
            Patient Self-Service Portal
          </span>
          <h1 className="text-2xl font-extrabold mt-1">Welcome, {user?.fullName}</h1>
          <p className="text-xs text-indigo-200 mt-0.5">
            Hospital Card: <strong>{user?.hospitalCardNumber || 'HCN-ACTIVE'}</strong>
          </p>
        </div>

        {activeTicket && (
          <div className="bg-[#0D9488] px-6 py-4 rounded-2xl shadow-lg text-center border border-teal-400/30">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-100 block">
              Active Queue Ticket ({activeTicket.status})
            </span>
            <span className="text-3xl font-black tracking-tight block">
              {ticketNumber}
            </span>
            <span className="text-xs font-semibold text-teal-100">
              {ticketRoom} • {ticketDoctor}
            </span>
          </div>
        )}
      </div>

      {feedback.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Book New Appointment */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
          <h2 className="text-lg font-extrabold text-[#1E293B]">
            1. Book Clinic Appointment
          </h2>

          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Select Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Available Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  {doctors.length === 0 && <option value="">No doctors available</option>}
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.fullName} ({doc.doctorProfile?.consultationRoom})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Appointment Date
              </label>
              <input
                type="date"
                value={appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Select Available 15-Min Slot ({availableSlots.length} open)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      type="button"
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        isSelected
                          ? 'bg-[#0D9488] text-white border-[#0D9488] shadow'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Symptoms or Reason for Visit
              </label>
              <textarea
                rows={2}
                value={symptomsOrReason}
                onChange={(e) => setSymptomsOrReason(e.target.value)}
                placeholder="Briefly describe your symptoms..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full bg-[#0D9488] hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow transition"
            >
              {loading ? 'Booking Slot...' : 'Confirm Appointment Slot'}
            </button>
          </form>
        </div>

        {/* Column 2: My Appointments & One-Click Queue Check-In */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-extrabold text-[#1E293B]">
            2. My Appointments & Queue Check-In
          </h2>

          {myAppointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              You have no booked appointments yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {myAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#312E81]">
                        {apt.appointmentReference}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {apt.doctorId?.fullName || 'Clinic Doctor'} • {apt.department}
                    </p>
                    <p className="text-xs text-slate-500">
                      Date: {new Date(apt.appointmentDate).toLocaleDateString()} | Time:{' '}
                      <strong>
                        {apt.timeSlot?.startTime} - {apt.timeSlot?.endTime}
                      </strong>
                    </p>
                  </div>

                  {apt.status === 'CONFIRMED' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCheckIn(apt.appointmentReference)}
                        className="bg-[#10B981] hover:bg-emerald-600 text-slate-900 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow transition"
                      >
                        Check In Now
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(apt._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-2 rounded-xl border border-red-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}