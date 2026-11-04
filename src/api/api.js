import axiosClient from './axiosClient';

export const AuthAPI = {
  login: (email, password) => axiosClient.post('/auth/login', { email, password }),
  registerPatient: (payload) => axiosClient.post('/auth/register', payload),
  getMe: () => axiosClient.get('/auth/me'),
};

export const AppointmentAPI = {
  getDoctorsByDepartment: (department) =>
    axiosClient.get('/appointments/doctors', { params: { department } }),
  getAvailableSlots: (doctorId, date) =>
    axiosClient.get('/appointments/slots', { params: { doctorId, date } }),
  bookAppointment: (payload) => axiosClient.post('/appointments/book', payload),
  getMyAppointments: () => axiosClient.get('/appointments/my-appointments'),
  cancelAppointment: (appointmentId, cancellationReason) =>
    axiosClient.patch(`/appointments/${appointmentId}/cancel`, { cancellationReason }),
};

export const QueueAPI = {
  checkIn: (payload) => axiosClient.post('/queue/check-in', payload),
  getMyActiveTicket: () => axiosClient.get('/queue/my-active-ticket'),
  callNextPatient: () => axiosClient.patch('/queue/call-next'),
  getDoctorActiveTicket: () => axiosClient.get('/queue/doctor-active'),
  completeConsultation: (ticketId) => axiosClient.patch(`/queue/${ticketId}/complete`),
  getLiveBoard: (department) => axiosClient.get(`/queue/live-board/${department}`),
};

export const AdminAPI = {
  onboardDoctor: (payload) => axiosClient.post('/admin/doctors', payload),
  getAllDoctors: () => axiosClient.get('/admin/doctors'),
  toggleDoctorAvailability: (doctorId, isAvailableToday) =>
    axiosClient.patch(`/admin/doctors/${doctorId}/availability`, { isAvailableToday }),
  getAnalytics: (date) => axiosClient.get('/admin/analytics', { params: date ? { date } : {} }),
};