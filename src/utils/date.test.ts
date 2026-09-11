import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from './date';

describe('formatRelativeTime', () => {
  it('trả về chuỗi rỗng khi giá trị truyền vào là null hoặc undefined', () => {
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime(undefined)).toBe('');
    expect(formatRelativeTime('')).toBe('');
  });

  it('trả về chuỗi rỗng khi chuỗi ngày tháng không hợp lệ', () => {
    expect(formatRelativeTime('invalid-date')).toBe('');
  });

  it('trả về "Vừa xong" khi thời gian dưới 60 giây trước', () => {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('Vừa xong');
  });

  it('trả về "X phút trước" khi thời gian trong vòng 60 phút', () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    expect(formatRelativeTime(tenMinutesAgo)).toBe('10 phút trước');
  });

  it('trả về "X giờ trước" khi thời gian trong vòng 24 giờ', () => {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe('3 giờ trước');
  });

  it('trả về "Hôm qua" khi thời gian là 1 ngày trước', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 25 * 3600 * 1000);
    expect(formatRelativeTime(yesterday)).toBe('Hôm qua');
  });

  it('trả về "X ngày trước" khi thời gian từ 2 đến 6 ngày trước', () => {
    const now = new Date();
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 3600 * 1000);
    expect(formatRelativeTime(fourDaysAgo)).toBe('4 ngày trước');
  });

  it('trả về định dạng "dd/MM/yyyy" khi thời gian quá 7 ngày trước', () => {
    const date = new Date('2025-01-15T10:00:00Z');
    const result = formatRelativeTime(date);
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
