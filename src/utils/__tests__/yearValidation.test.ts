import { describe, expect, it } from 'vitest';
import {
  getMaxCompletionYear,
  MIN_COMPLETION_YEAR,
  sanitizeYearInput,
  validateCompletionYear,
} from '../yearValidation';

describe('yearValidation', () => {
  describe('sanitizeYearInput', () => {
    it('trả về chuỗi rỗng khi giá trị là null, undefined hoặc rỗng', () => {
      expect(sanitizeYearInput(null)).toBe('');
      expect(sanitizeYearInput(undefined)).toBe('');
      expect(sanitizeYearInput('')).toBe('');
    });

    it('loại bỏ ký tự không phải số và giữ lại các chữ số', () => {
      expect(sanitizeYearInput('20a2b4')).toBe('2024');
      expect(sanitizeYearInput(' 2 0 2 5 ')).toBe('2025');
      expect(sanitizeYearInput('năm-2026!')).toBe('2026');
    });

    it('cắt tối đa 4 chữ số đầu tiên', () => {
      expect(sanitizeYearInput('20245678')).toBe('2024');
    });
  });

  describe('validateCompletionYear', () => {
    const maxYear = getMaxCompletionYear();

    it('hợp lệ khi không nhập năm (trường tùy chọn)', () => {
      expect(validateCompletionYear('')).toEqual({
        isValid: true,
        numericYear: null,
      });
      expect(validateCompletionYear('   ')).toEqual({
        isValid: true,
        numericYear: null,
      });
      expect(validateCompletionYear(null)).toEqual({
        isValid: true,
        numericYear: null,
      });
      expect(validateCompletionYear(undefined)).toEqual({
        isValid: true,
        numericYear: null,
      });
    });

    it('không báo lỗi khi người dùng đang nhập dở (1-3 số) và chưa submit', () => {
      expect(validateCompletionYear('2', false)).toEqual({
        isValid: true,
        numericYear: null,
      });
      expect(validateCompletionYear('20', false)).toEqual({
        isValid: true,
        numericYear: null,
      });
      expect(validateCompletionYear('202', false)).toEqual({
        isValid: true,
        numericYear: null,
      });
    });

    it('báo lỗi yêu cầu đủ 4 chữ số khi submit form với số năm chưa hoàn chỉnh', () => {
      const result = validateCompletionYear('20', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Năm hoàn thành phải đủ 4 chữ số (VD: 2024).');
      expect(result.numericYear).toBeNull();
    });

    it('hợp lệ khi nhập đủ 4 chữ số trong khoảng cho phép', () => {
      expect(validateCompletionYear('2024', false)).toEqual({
        isValid: true,
        numericYear: 2024,
      });
      expect(validateCompletionYear('1900', false)).toEqual({
        isValid: true,
        numericYear: 1900,
      });
      expect(validateCompletionYear(String(maxYear), false)).toEqual({
        isValid: true,
        numericYear: maxYear,
      });
    });

    it('báo lỗi khi nhập năm nhỏ hơn 1900', () => {
      const result = validateCompletionYear('1899', false);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(`Năm hoàn thành phải nằm trong khoảng ${MIN_COMPLETION_YEAR}–${maxYear}.`);
      expect(result.numericYear).toBeNull();
    });

    it('báo lỗi khi nhập năm lớn hơn năm tối đa cho phép', () => {
      const result = validateCompletionYear(String(maxYear + 1), false);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(`Năm hoàn thành phải nằm trong khoảng ${MIN_COMPLETION_YEAR}–${maxYear}.`);
      expect(result.numericYear).toBeNull();
    });

    it('cho phép tùy biến maxYear khi kiểm tra', () => {
      expect(validateCompletionYear('2030', false, 2030)).toEqual({
        isValid: true,
        numericYear: 2030,
      });
      expect(validateCompletionYear('2031', false, 2030).isValid).toBe(false);
    });
  });
});
