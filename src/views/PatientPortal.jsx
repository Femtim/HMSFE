import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { socket } from '../api/socketClient';

const DEPARTMENTS = ['GENERAL_OPD', 'PEDIATRICS', 'CARDIOLOGY', 'OBGYN', 'ORTHOPEDICS', 'DENTAL'];

export default function PatientPortal() {
  const { user, logout } = useAuth();

  const [department, setDepartment] = useState('GENERAL_OPD');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');

  const [myAppointments, setMyAppointments] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchMyAppointments = async () => {
    try {
      const res = await axiosClient.get('/appointments/my-appointments');
      setMyAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  // Load doctors whenever department changes
  useEffect(() => {
    axiosClient
      .get(`/appointments/doctors?department=${department}`)
      .then((res) => {
        const list = res.data.data || [];
        setDoctors(list);
        setSelectedDoctor(list[0]?._id || '');
      })
      .catch(() => setDoctors([]));
  }, [department]);

  // Load available slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctor || !appointmentDate) {
      setAvailableSlots([]);
      return;
    }
    axiosClient
      .get(`/appointments/slots?doctorId=${selectedDoctor}&date=${appointmentDate}`)
      .then((res) => {
        setAvailableSlots(res.data.availableSlots || []);
        setSelectedSlot(null);
      })
      .catch(() => setAvailableSlots([]));
  }, [selectedDoctor, appointmentDate]);

  // Real-time Socket.io listener for active queue ticket
  useEffect(() => {
    if (!activeTicket?.department) return;

    socket.emit('join:department', activeTicket.department);

    const handlePatientCalled = (payload) => {
      if (payload.ticketNumber === activeTicket.ticketNumber) {
        setActiveTicket((prev) => ({
          ...prev,
          status: 'CALLED',
          patientsAhead: 0,
          estimatedWaitTimeMins: 0,
        }));
      } else {
        setActiveTicket((prev) =>
          prev && prev.patientsAhead > 0
            ? {
                ...prev,
                patientsAhead: prev.patientsAhead - 1,
                estimatedWaitTimeMins: Math.max(0, prev.estimatedWaitTimeMins - 15),
              }
            : prev
        );
      }
    };

    socket.on('queue:patient_called', handlePatientCalled);
    return () => socket.off('queue:patient_called', handlePatientCalled);
  }, [activeTicket]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setFeedback({ type: 'error', text: 'Please select an available time slot.' });
      return;
    }

    setBookingLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const res = await axiosClient.post('/appointments/book', {
        doctorId: selectedDoctor,
        appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        symptomsOrReason: symptoms,
      });

      setFeedback({
        type: 'success',
        text: `Booked! Reference: ${res.data.data.appointmentReference}`,
      });
      setSymptoms('');
      fetchMyAppointments();

      // Refresh open slots
      const slotsRes = await axiosClient.get(
        `/appointments/slots?doctorId=${selectedDoctor}&date=${appointmentDate}`
      );
      setAvailableSlots(slotsRes.data.availableSlots || []);
      setSelectedSlot(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Could not book slot.',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCheckIn = async (appointmentReference) => {
    try {
      const res = await axiosClient.post('/queue/check-in', { appointmentReference });
      setActiveTicket({ ...res.data.data, status: 'WAITING' });
      fetchMyAppointments();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Check-in failed.',
      });
    }
  };

  const cardNumber = user?.hospitalCardNumber || user?.profile?.hospitalCardNumber || 'HCN-VERIFIED';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar */}
        <header className="bg-[#1E293B] text-white p-6 rounded-2xl shadow-md flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="bg-[#0D9488] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Hospital Card: {cardNumber}
            </span>
            <h1 className="text-2xl font-bold mt-2">Welcome, {user?.fullName}</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Book appointments and monitor your real-time consultation queue
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-slate-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            Sign Out
          </button>
        </header>

        {/* Active Live Queue Ticket Card */}
        {activeTicket && (
          <div className="bg-white rounded-2xl shadow-lg border-t-8 border-[#10B981] p-8 text-center space-y-5">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700">
              {activeTicket.priority} PRIORITY • {activeTicket.department}
            </span>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Your Active Queue Ticket
              </p>
              <h2 className="text-6xl font-black text-[#1E293B] mt-1">{activeTicket.ticketNumber}</h2>
            </div>

            {activeTicket.status === 'CALLED' ? (
              <div className="bg-[#10B981] text-slate-900 p-5 rounded-xl animate-pulse">
                <p className="text-xl font-extrabold">
                  🔊 Now Calling! Proceed to {activeTicket.consultationRoom}
                </p>
                <p className="text-sm font-medium mt-1">
                  {activeTicket.doctor} is waiting for you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Patients Ahead</p>
                  <p className="text-3xl font-extrabold text-[#312E81] mt-1">
                    {activeTicket.patientsAhead}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Estimated Wait</p>
                  <p className="text-3xl font-extrabold text-[#0D9488] mt-1">
                    ~{activeTicket.estimatedWaitTimeMins}m
                  </p>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 flex justify-center gap-6 border-t pt-4">
              <span>Doctor: <strong>{activeTicket.doctor}</strong></span>
              <span>Room: <strong>{activeTicket.consultationRoom}</strong></span>
            </div>
          </div>
        )}

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Book Appointment */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-[#312E81] border-b pb-3">
              1. Schedule a Hospital Appointment
            </h2>

            {feedback.text && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Select Doctor
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    disabled={doctors.length === 0}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {doctors.length === 0 ? (
                      <option value="">No doctors available</option>
                    ) : (
                      doctors.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          {doc.fullName} ({doc.doctorProfile?.consultationRoom})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Available 15-Min Slots ({availableSlots.length} open)
                </label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot.startTime}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 rounded-lg text-xs font-bold border transition ${
                          selectedSlot?.startTime === slot.startTime
                            ? 'bg-[#0D9488] text-white border-[#0D9488]'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3">
                    No open slots found. Select an active doctor or another date.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Symptoms / Reason for Visit
                </label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Routine checkup, headache..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading || !selectedDoctor}
                className="w-full bg-[#312E81] hover:bg-indigo-900 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow transition"
              >
                {bookingLoading ? 'Confirming Slot...' : 'Book Appointment Slot'}
              </button>
            </form>
          </div>

          {/* Right Column: My Appointments & Queue Check-In */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-[#1E293B] border-b pb-3">
              2. My Appointments & Hospital Check-In
            </h2>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {myAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="p-4 rounded-xl border border-slate-200 flex justify-between items-center bg-slate-50"
                >
                  <div>
                    <span className="text-xs font-bold text-[#312E81]">
                      {apt.appointmentReference}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">
                      {apt.doctorId?.fullName || 'Assigned Doctor'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {new Date(apt.appointmentDate).toLocaleDateString()} at{' '}
                      {apt.timeSlot?.startTime} • {apt.department}
                    </p>
                  </div>

                  {apt.status === 'CONFIRMED' ? (
                    <button
                      onClick={() => handleCheckIn(apt.appointmentReference)}
                      className="bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
                    >
                      Check In Now
                    </button>
                  ) : (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        apt.status === 'CHECKED_IN'
                          ? 'bg-amber-100 text-amber-800'
                          : apt.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {apt.status}
                    </span>
                  )}
                </div>
              ))}

              {myAppointments.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">
                  You have no scheduled appointments yet. Book a time slot on the left to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}