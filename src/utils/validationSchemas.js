import * as Yup from 'yup';

const phoneRegExp = /^(\+?234|0)?[789][01]\d{8}$/;

export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerPatientSchema = Yup.object({
  fullName: Yup.string()
    .min(3, 'Full name must be at least 3 characters')
    .required('Full name is required'),
  phone: Yup.string()
    .matches(
      phoneRegExp,
      'Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)'
    )
    .required('Phone number is required'),
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  gender: Yup.string()
    .oneOf(['MALE', 'FEMALE', 'OTHER'])
    .required('Gender is required'),
  bloodGroup: Yup.string()
    .oneOf(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])
    .required('Blood group is required'),
  isVulnerable: Yup.boolean(),
});

export const updatePatientProfileSchema = Yup.object({
  fullName: Yup.string()
    .min(3, 'Full name must be at least 3 characters')
    .required('Full name is required'),
  phone: Yup.string()
    .matches(
      phoneRegExp,
      'Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)'
    )
    .required('Phone number is required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .nullable(),
  gender: Yup.string()
    .oneOf(['MALE', 'FEMALE', 'OTHER'])
    .required('Gender is required'),
  bloodGroup: Yup.string()
    .oneOf(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])
    .required('Blood group is required'),
  isVulnerable: Yup.boolean(),
});

export const onboardDoctorSchema = Yup.object({
  fullName: Yup.string()
    .min(3, 'Full name must be at least 3 characters')
    .required('Doctor full name is required'),
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email address is required'),
  phone: Yup.string()
    .matches(phoneRegExp, 'Enter a valid Nigerian phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Temporary password must be at least 8 characters')
    .required('Temporary password is required'),
  department: Yup.string()
    .oneOf([
      'GENERAL_OPD',
      'PEDIATRICS',
      'CARDIOLOGY',
      'OBGYN',
      'ORTHOPEDICS',
      'DENTAL',
    ])
    .required('Department is required'),
  specialization: Yup.string().required('Specialization is required'),
  consultationRoom: Yup.string().required('Consultation room is required'),
  avgConsultationTimeMins: Yup.number()
    .min(5, 'Minimum 5 minutes')
    .max(120, 'Maximum 120 minutes')
    .required('Average consultation time is required'),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Registered email address is required'),
});

export const resetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, 'New password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password'),
});

export const updatePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'New password must be at least 8 characters')
    .notOneOf(
      [Yup.ref('currentPassword')],
      'New password must be different from current password'
    )
    .required('New password is required'),
});

export const deleteAccountSchema = Yup.object({
  password: Yup.string().required('Please enter your password to confirm deletion'),
});