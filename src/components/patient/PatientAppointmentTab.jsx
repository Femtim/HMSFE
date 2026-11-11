import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { DEPARTMENTS } from '../navigation/navConfig';

export default function PatientAppointmentTab() {
  const {
    department,
    setDepartment,
    doctors = [],
    selectedDoctor,
    setSelectedDoctor,
    appointmentDate,
    setAppointmentDate,
    availableSlots = [],
    selectedSlot,
    setSelectedSlot,
    symptomsOrReason,
    setSymptomsOrReason,
    loading,
    feedback = { type: '', text: '' },
    myAppointments = [],
    onBookAppointment,
    onCheckIn,
    onCancelAppointment,
  } = useOutletContext();

  return (
    <>
      {feedback.text && (
        <div
          className={`p-3 rounded text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-semibold text-slate-900">Book Consultation</h2>
            <p className="text-xs text-slate-500">
              Select a clinic unit, doctor, and available time slot
            </p>
          </div>

          <form onSubmit={onBookAppointment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-sm bg-white"
                >
                  {doctors.length === 0 && <option value="">No Doctor on duty</option>}
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.fullName} ({doc.doctorProfile?.consultationRoom})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Available Time Slots ({availableSlots.length})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-0.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      type="button"
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-1.5 px-2 rounded text-xs font-mono font-medium border transition ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600'
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
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reason for Visit / Symptoms
              </label>
              <textarea
                rows={2}
                value={symptomsOrReason}
                onChange={(e) => setSymptomsOrReason(e.target.value)}
                placeholder="Optional notes for the clinician"
                className="w-full px-3 py-2 rounded border border-slate-300 text-sm outline-none focus:border-teal-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded text-sm transition"
            >
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>

        <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-semibold text-slate-900">Scheduled Appointments</h2>
            <p className="text-xs text-slate-500">Check in upon arrival at the hospital</p>
          </div>

          {myAppointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">
              No appointments scheduled.
            </p>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {myAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="p-3.5 rounded border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-800">
                        {apt.appointmentReference}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {apt.doctorId?.fullName || 'Clinician'} · {apt.department}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(apt.appointmentDate).toLocaleDateString()} at{' '}
                      <strong className="text-slate-700 font-mono">
                        {apt.timeSlot?.startTime} – {apt.timeSlot?.endTime}
                      </strong>
                    </p>
                  </div>

                  {apt.status === 'CONFIRMED' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onCheckIn(apt.appointmentReference)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs px-3 py-1.5 rounded transition"
                      >
                        Check In
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelAppointment(apt._id)}
                        className="bg-white hover:bg-red-50 text-red-600 font-medium text-xs px-3 py-1.5 rounded border border-slate-200"
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
    </>
  );
}