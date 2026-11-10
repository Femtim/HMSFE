export const DEPARTMENTS = [
  {
    id: 'GENERAL_OPD',
    label: 'General OPD',
    desc: 'Primary outpatient consultations, routine diagnostics, and medical referrals.',
  },
  {
    id: 'PEDIATRICS',
    label: 'Pediatrics',
    desc: 'Specialized neonatal, infant, and adolescent healthcare and immunization.',
  },
  {
    id: 'CARDIOLOGY',
    label: 'Cardiology',
    desc: 'Cardiovascular diagnostics, ECG monitoring, and hypertension management.',
  },
  {
    id: 'OBGYN',
    label: 'Obstetrics & Gynecology',
    desc: 'Antenatal care, maternal health monitoring, and gynecological consultations.',
  },
  {
    id: 'ORTHOPEDICS',
    label: 'Orthopedics',
    desc: 'Musculoskeletal care, fracture management, and joint rehabilitation.',
  },
  {
    id: 'DENTAL',
    label: 'Dental Clinic',
    desc: 'Oral examination, restorative dentistry, and maxillofacial care.',
  },
];

export const PATIENT_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/patient/dashboard' },
  { id: 'appointment', label: 'Appointment', path: '/patient/appointment' },
  { id: 'services', label: 'Our Services', path: '/patient/services' },
  { id: 'about', label: 'About Us', path: '/patient/about' },
  { id: 'contact', label: 'Contact Us', path: '/patient/contact' },
  { id: 'profile', label: 'Profile', path: '/patient/profile' },
];

export const DOCTOR_NAV_ITEMS = [
  { id: 'desk', label: 'Consultation Desk', path: '/doctor/desk' },
  { id: 'triage', label: 'Triage Protocol', path: '/doctor/triage' },
  { id: 'schedule', label: 'Shift & Room Assignment', path: '/doctor/schedule' },
];

export const ADMIN_NAV_ITEMS = [
  { id: 'operations', label: 'Staff & Operations', path: '/admin/operations' },
  { id: 'analytics', label: 'Department Metrics', path: '/admin/analytics' },
  { id: 'directory', label: 'Clinician Directory', path: '/admin/directory' },
];

export const ROLE_NAV_MAP = {
  PATIENT: PATIENT_NAV_ITEMS,
  DOCTOR: DOCTOR_NAV_ITEMS,
  SUPER_ADMIN: ADMIN_NAV_ITEMS,
};