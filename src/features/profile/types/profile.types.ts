export interface UserProfile {
  userCode: string;
  fullName: string;
  dob: string | null;
  email: string;
  phone: string | null;
  gender: string;
  role: string;
  major: string | null;
  subMajor: string | null;
  department: string | null;
  isActive: boolean;
}

export interface UpdateProfileRequest {
  dob?: string;
  phone?: string;
  gender?: number;
}
