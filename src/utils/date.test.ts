import { describe, expect, it } from 'vitest';
import { formatDateTime, formatRelativeTime, parseDate } from './date';

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

  it('xử lý chính xác chuỗi ISO UTC không có hậu tố "Z" từ server', () => {
    const now = new Date();
    // Tạo chuỗi ISO 30 giây trước nhưng không có 'Z'
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    const isoWithoutZ = thirtySecondsAgo.toISOString().replace('Z', '');
    expect(formatRelativeTime(isoWithoutZ)).toBe('Vừa xong');
  });
});

describe('parseDate', () => {
  it('trả về null cho input rỗng hoặc không hợp lệ', () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate('   ')).toBeNull();
    expect(parseDate('invalid-date')).toBeNull();
  });

  it('trả về chính Date object nếu input là Date hợp lệ', () => {
    const date = new Date();
    expect(parseDate(date)).toBe(date);
  });

  it('trả về null nếu Date object không hợp lệ (NaN)', () => {
    expect(parseDate(new Date('invalid'))).toBeNull();
  });

  it('tự động gắn hậu tố Z cho chuỗi ISO không có múi giờ để đọc chuẩn UTC', () => {
    const parsed = parseDate('2026-09-29T08:30:00');
    expect(parsed).not.toBeNull();
    expect(parsed?.toISOString()).toBe('2026-09-29T08:30:00.000Z');
  });

  it('giữ nguyên chuỗi ISO đã có hậu tố Z hoặc offset múi giờ', () => {
    const parsedWithZ = parseDate('2026-09-29T08:30:00Z');
    expect(parsedWithZ?.toISOString()).toBe('2026-09-29T08:30:00.000Z');

    const parsedWithOffset = parseDate('2026-09-29T15:30:00+07:00');
    expect(parsedWithOffset?.toISOString()).toBe('2026-09-29T08:30:00.000Z');
  });
});

describe('formatDateTime', () => {
  it('trả về "-" khi input là null, undefined hoặc rỗng', () => {
    expect(formatDateTime(null)).toBe('-');
    expect(formatDateTime(undefined)).toBe('-');
    expect(formatDateTime('')).toBe('-');
    expect(formatDateTime('invalid-date')).toBe('-');
  });

  it('định dạng ngày giờ chuẩn dd/MM/yyyy HH:mm', () => {
    const result = formatDateTime('2026-09-29T08:30:00Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });
});
