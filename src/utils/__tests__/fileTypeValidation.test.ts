import { describe, expect, it } from 'vitest';
import { validateCustomFileTypeName } from '../fileTypeValidation';

describe('validateCustomFileTypeName', () => {
  it('từ chối giá trị rỗng hoặc chỉ có khoảng trắng', () => {
    expect(validateCustomFileTypeName('')).toEqual({
      isValid: false,
      error: 'Vui lòng nhập tên loại tài nguyên khi chọn loại "Khác".',
    });
    expect(validateCustomFileTypeName('   ')).toEqual({
      isValid: false,
      error: 'Vui lòng nhập tên loại tài nguyên khi chọn loại "Khác".',
    });
    expect(validateCustomFileTypeName(null)).toEqual({
      isValid: false,
      error: 'Vui lòng nhập tên loại tài nguyên khi chọn loại "Khác".',
    });
  });

  it('từ chối chuỗi quá ngắn (< 3 ký tự)', () => {
    const result = validateCustomFileTypeName('ab');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('tối thiểu 3 ký tự');
  });

  it('từ chối chuỗi quá dài (> 50 ký tự)', () => {
    const longString = 'Tài liệu tham khảo chuyên sâu dành cho sinh viên đại học ngành công nghệ';
    const result = validateCustomFileTypeName(longString);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('không được vượt quá 50 ký tự');
  });

  it('chặn đứng các nỗ lực chèn thẻ HTML hoặc mã độc XSS', () => {
    expect(validateCustomFileTypeName('<script>alert(1)</script>').isValid).toBe(false);
    expect(validateCustomFileTypeName('<img src=x onerror=alert(1)>').isValid).toBe(false);
    expect(validateCustomFileTypeName('javascript:void(0)').isValid).toBe(false);
    expect(validateCustomFileTypeName('Tài liệu <style>').isValid).toBe(false);
  });

  it('chặn các ký tự đặc biệt nguy hiểm hoặc không phù hợp', () => {
    expect(validateCustomFileTypeName('Tài liệu ; DROP TABLE File;').isValid).toBe(false);
    expect(validateCustomFileTypeName('Tài liệu {test}').isValid).toBe(false);
    expect(validateCustomFileTypeName('Tài liệu [123]').isValid).toBe(false);
    expect(validateCustomFileTypeName('Tài liệu $dollar').isValid).toBe(false);
    expect(validateCustomFileTypeName('Tài liệu = value').isValid).toBe(false);
    expect(validateCustomFileTypeName('Tài liệu / gạch chéo').isValid).toBe(false);
    expect(validateCustomFileTypeName('Tài liệu \\ gạch chéo ngược').isValid).toBe(false);
  });

  it('chặn chuỗi chỉ toàn số hoặc toàn ký tự đặc biệt', () => {
    const numbersOnly = validateCustomFileTypeName('123456');
    expect(numbersOnly.isValid).toBe(false);
    expect(numbersOnly.error).toContain('chứa ít nhất 2 chữ cái');

    const symbolsOnly = validateCustomFileTypeName('---...---');
    expect(symbolsOnly.isValid).toBe(false);
  });

  it('chặn spam ký tự lặp liên tiếp', () => {
    const repeatedChars = validateCustomFileTypeName('aaaaaaa');
    expect(repeatedChars.isValid).toBe(false);
    expect(repeatedChars.error).toContain('không được chứa ký tự lặp vô nghĩa liên tiếp');

    const repeatedDots = validateCustomFileTypeName('Tài liệu ......');
    expect(repeatedDots.isValid).toBe(false);
  });

  it('chặn các từ khóa rác / placeholder phổ biến', () => {
    expect(validateCustomFileTypeName('test').isValid).toBe(false);
    expect(validateCustomFileTypeName('asdf').isValid).toBe(false);
    expect(validateCustomFileTypeName('abc').isValid).toBe(false);
    expect(validateCustomFileTypeName('khác').isValid).toBe(false);
    expect(validateCustomFileTypeName('Khac').isValid).toBe(false);
    expect(validateCustomFileTypeName('other').isValid).toBe(false);
  });

  it('chấp nhận các tên loại tài nguyên học thuật hợp lệ và chuẩn hóa khoảng trắng', () => {
    const result1 = validateCustomFileTypeName('Tài liệu tham khảo');
    expect(result1).toEqual({
      isValid: true,
      sanitized: 'Tài liệu tham khảo',
    });

    const result2 = validateCustomFileTypeName('  Đề cương   chi tiết  ');
    expect(result2).toEqual({
      isValid: true,
      sanitized: 'Đề cương chi tiết',
    });

    const result3 = validateCustomFileTypeName('Tóm tắt luận văn (NCS)');
    expect(result3).toEqual({
      isValid: true,
      sanitized: 'Tóm tắt luận văn (NCS)',
    });

    const result4 = validateCustomFileTypeName('Giáo trình C# - 2026.v1');
    expect(result4).toEqual({
      isValid: true,
      sanitized: 'Giáo trình C# - 2026.v1',
    });
  });
});
