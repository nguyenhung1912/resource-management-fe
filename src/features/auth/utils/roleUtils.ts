import type { UserRole } from '@/features/auth/types/auth.types';

const STUDENT_ROLES = new Set(['student', 'sinh vien', 'sinh viên']);
const LECTURER_ROLES = new Set(['lecturer', 'giang vien', 'giảng viên', 'teacher']);
const ADMIN_ROLES = new Set(['admin', 'administrator', 'quan tri vien', 'quản trị viên']);

function cleanRoleString(role?: string | null): string {
  return (role ?? '').trim().toLowerCase();
}

/**
 * Kiểm tra xem vai trò có phải là Sinh viên không (hỗ trợ tiếng Anh và tiếng Việt).
 */
export function isStudentRole(role?: string | null): boolean {
  return STUDENT_ROLES.has(cleanRoleString(role));
}

/**
 * Kiểm tra xem vai trò có phải là Giảng viên không (hỗ trợ tiếng Anh và tiếng Việt).
 */
export function isLecturerRole(role?: string | null): boolean {
  return LECTURER_ROLES.has(cleanRoleString(role));
}

/**
 * Kiểm tra xem vai trò có phải là Quản trị viên không (hỗ trợ tiếng Anh và tiếng Việt).
 */
export function isAdminRole(role?: string | null): boolean {
  return ADMIN_ROLES.has(cleanRoleString(role));
}

/**
 * Chuẩn hóa chuỗi vai trò về dạng canonical 'Student' | 'Lecturer' | 'Admin'.
 */
export function normalizeRole(role?: string | null): 'Student' | 'Lecturer' | 'Admin' | undefined {
  if (isStudentRole(role)) return 'Student';
  if (isLecturerRole(role)) return 'Lecturer';
  if (isAdminRole(role)) return 'Admin';
  return undefined;
}

/**
 * Kiểm tra xem vai trò người dùng có khớp với vai trò mục tiêu không.
 */
export function isRoleMatch(targetRole: UserRole, userRole?: string | null): boolean {
  const normalizedTarget = normalizeRole(targetRole);
  const normalizedUser = normalizeRole(userRole);

  if (normalizedTarget && normalizedUser) {
    return normalizedTarget === normalizedUser;
  }

  // Fallback so khớp chuỗi không phân biệt hoa thường
  return cleanRoleString(targetRole) === cleanRoleString(userRole);
}

/**
 * Kiểm tra xem vai trò người dùng có nằm trong danh sách các vai trò cho phép hay không.
 */
export function hasAnyRole(targetRoles: UserRole[], userRole?: string | null): boolean {
  if (!targetRoles || targetRoles.length === 0) return true;
  return targetRoles.some((role) => isRoleMatch(role, userRole));
}
