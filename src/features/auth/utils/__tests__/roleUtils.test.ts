import { describe, expect, it } from 'vitest';
import { hasAnyRole, isAdminRole, isLecturerRole, isRoleMatch, isStudentRole, normalizeRole } from '../roleUtils';

describe('roleUtils', () => {
  describe('isStudentRole', () => {
    it('nhận diện đúng các biến thể vai trò Sinh viên', () => {
      expect(isStudentRole('Student')).toBe(true);
      expect(isStudentRole('student')).toBe(true);
      expect(isStudentRole('Sinh viên')).toBe(true);
      expect(isStudentRole('sinh vien')).toBe(true);
      expect(isStudentRole('  Sinh Viên  ')).toBe(true);
    });

    it('trả về false cho vai trò khác hoặc không hợp lệ', () => {
      expect(isStudentRole('Lecturer')).toBe(false);
      expect(isStudentRole('Admin')).toBe(false);
      expect(isStudentRole('Giảng viên')).toBe(false);
      expect(isStudentRole(null)).toBe(false);
      expect(isStudentRole(undefined)).toBe(false);
      expect(isStudentRole('')).toBe(false);
    });
  });

  describe('isLecturerRole', () => {
    it('nhận diện đúng các biến thể vai trò Giảng viên', () => {
      expect(isLecturerRole('Lecturer')).toBe(true);
      expect(isLecturerRole('lecturer')).toBe(true);
      expect(isLecturerRole('Giảng viên')).toBe(true);
      expect(isLecturerRole('giang vien')).toBe(true);
      expect(isLecturerRole('teacher')).toBe(true);
    });

    it('trả về false cho vai trò khác', () => {
      expect(isLecturerRole('Student')).toBe(false);
      expect(isLecturerRole('Admin')).toBe(false);
      expect(isLecturerRole(null)).toBe(false);
    });
  });

  describe('isAdminRole', () => {
    it('nhận diện đúng các biến thể vai trò Quản trị viên', () => {
      expect(isAdminRole('Admin')).toBe(true);
      expect(isAdminRole('admin')).toBe(true);
      expect(isAdminRole('Quản trị viên')).toBe(true);
      expect(isAdminRole('quan tri vien')).toBe(true);
      expect(isAdminRole('administrator')).toBe(true);
    });

    it('trả về false cho vai trò khác', () => {
      expect(isAdminRole('Student')).toBe(false);
      expect(isAdminRole('Lecturer')).toBe(false);
      expect(isAdminRole(null)).toBe(false);
    });
  });

  describe('normalizeRole', () => {
    it('chuẩn hóa về dạng canonical tương ứng', () => {
      expect(normalizeRole('Sinh viên')).toBe('Student');
      expect(normalizeRole('student')).toBe('Student');
      expect(normalizeRole('Giảng viên')).toBe('Lecturer');
      expect(normalizeRole('lecturer')).toBe('Lecturer');
      expect(normalizeRole('Quản trị viên')).toBe('Admin');
      expect(normalizeRole('ADMIN')).toBe('Admin');
    });

    it('trả về undefined cho vai trò không xác định', () => {
      expect(normalizeRole('UnknownRole')).toBeUndefined();
      expect(normalizeRole(null)).toBeUndefined();
      expect(normalizeRole('')).toBeUndefined();
    });
  });

  describe('isRoleMatch', () => {
    it('so khớp chính xác giữa tiếng Anh và tiếng Việt', () => {
      expect(isRoleMatch('Student', 'Sinh viên')).toBe(true);
      expect(isRoleMatch('Sinh viên', 'Student')).toBe(true);
      expect(isRoleMatch('Lecturer', 'Giảng viên')).toBe(true);
      expect(isRoleMatch('Admin', 'Quản trị viên')).toBe(true);
    });

    it('trả về false khi không khớp vai trò', () => {
      expect(isRoleMatch('Student', 'Lecturer')).toBe(false);
      expect(isRoleMatch('Admin', 'Sinh viên')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('trả về true khi vai trò người dùng nằm trong danh sách cho phép', () => {
      expect(hasAnyRole(['Admin', 'Lecturer'], 'Giảng viên')).toBe(true);
      expect(hasAnyRole(['Student'], 'Sinh viên')).toBe(true);
      expect(hasAnyRole(['Admin'], 'Admin')).toBe(true);
    });

    it('trả về false khi vai trò người dùng không nằm trong danh sách cho phép', () => {
      expect(hasAnyRole(['Admin'], 'Sinh viên')).toBe(false);
      expect(hasAnyRole(['Lecturer'], 'Student')).toBe(false);
    });

    it('trả về true nếu danh sách vai trò cho phép rỗng', () => {
      expect(hasAnyRole([], 'Student')).toBe(true);
    });
  });
});
