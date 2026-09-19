export type VerificationTargetRole = 'nurse' | 'student';

export type VerificationType =
  | 'nurse_email'
  | 'nurse_license'
  | 'nurse_certificate'
  | 'license'
  | 'employment_cert'
  | 'work_email'
  | 'employee_id'
  | 'student_id'
  | 'enrollment_cert'
  | 'tuition_bill';

export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  targetRole: VerificationTargetRole;
  verificationType: VerificationType;
  hospitalOrSchool: string;
  organizationName?: string;
  departmentOrMajor?: string;
  licenseNumber?: string;
  documentName?: string;
  documentUrl: string; // Document image URL or official work email
  submittedAt: string;
  status: VerificationStatus;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface VerificationSubmissionData {
  targetRole: VerificationTargetRole;
  verificationType: VerificationType;
  hospitalOrSchool?: string;
  organizationName?: string;
  departmentOrMajor?: string;
  licenseNumber?: string;
  documentName?: string;
  documentUrl: string;
}
