export interface AdminUser {
  uid: string;

  userCode: string;

  firstName?: string | null;
  lastName?: string | null;

  fullName: string;

  dob?: string | null;

  email: string;

  phone?: string | null;

  gender?: number | null;

  roleId?: number | null;
  role?: string | null;

  majorId?: string | null;
  major?: string | null;

  subMajorCode?: string | null;
  subMajor?: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Role {
  roleId: number;
  roleName: string;
  roleDescription?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminUserQuery {
  search?: string;

  roleId?: number;

  isActive?: boolean;

  majorId?: string;

  subMajorCode?: string;

  pageNumber?: number;

  pageSize?: number;
}

export interface MessageResponse {
  message: string;
}

export interface CreateAdminUserRequest {
  userCode: string;

  firstName: string;

  lastName: string;

  password: string;

  dob?: string | null;

  email: string;

  phone?: string | null;

  gender: number;

  roleId: number;

  majorId?: string | null;

  subMajorCode?: string | null;

  isActive: boolean;
}

export interface UpdateAdminUserRequest {
  userCode?: string;

  firstName?: string;

  lastName?: string;

  dob?: string | null;

  email?: string;

  phone?: string | null;

  gender?: number;

  majorId?: string | null;

  subMajorCode?: string | null;
}
