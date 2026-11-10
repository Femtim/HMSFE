import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import socket from '../api/socketClient';
import { useAuth } from '../context/AuthContext';

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
      setFeedback({ type: 'error', text: 'Select a doctor and an available time slot.' });
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
      setFeedback({ type: 'success', text: 'Appointment confirmed.' });
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
        text: 'Checked into queue.',
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
        cancellationReason: 'Cancelled by patient',
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
      : activeTicket?.doctorId?.fullName || 'Assigned Clinician';

  const cardNumber =
    user?.hospitalCardNumber || user?.patientProfile?.hospitalCardNumber || 'N/A';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white border border-slate-200 p-5 rounded-md shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Outpatient Portal
          </p>
          <h1 className="text-lg font-semibold text-slate-900 mt-0.5">{user?.fullName}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Card Number:{' '}
            <span className="font-mono font-medium text-slate-800">{cardNumber}</span>
          </p>
        </div>

        {activeTicket && (
          <div className="bg-teal-50 border border-teal-200 px-4 py-2.5 rounded text-right">
            <span className="text-[10px] font-medium text-teal-800 uppercase block tracking-wider">
              Queue Ticket ({activeTicket.status})
            </span>
            <span className="text-xl font-bold font-mono text-teal-900 block">
              {ticketNumber}
            </span>
            <span className="text-xs text-teal-700">
              {ticketRoom} · {ticketDoctor}
            </span>
          </div>
        )}
      </div>

      <Outlet
        context={{
          user,
          department,
          setDepartment,
          doctors,
          selectedDoctor,
          setSelectedDoctor,
          appointmentDate,
          setAppointmentDate,
          availableSlots,
          selectedSlot,
          setSelectedSlot,
          symptomsOrReason,
          setSymptomsOrReason,
          loading,
          feedback,
          myAppointments,
          activeTicket,
          onBookAppointment: handleBookAppointment,
          onCheckIn: handleCheckIn,
          onCancelAppointment: handleCancelAppointment,
        }}
      />
    </div>
  );
}