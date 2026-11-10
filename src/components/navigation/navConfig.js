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

export const STAFF_NAV_ITEMS = {
  DOCTOR: [
    { id: 'dashboard', label: 'Consultation Desk' },
    { id: 'triage', label: 'Triage Protocol' },
    { id: 'schedule', label: 'Shift & Room Assignment' },
  ],
  SUPER_ADMIN: [
    { id: 'dashboard', label: 'Staff & Operations' },
    { id: 'analytics', label: 'Department Metrics' },
    { id: 'directory', label: 'Clinician Directory' },
  ],
};