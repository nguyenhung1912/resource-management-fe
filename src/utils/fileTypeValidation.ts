const SAFE_CHARACTERS_REGEX = /^[\p{L}\p{N}\s\-().+#]+$/u;
const LETTER_COUNT_REGEX = /\p{L}/gu;
const REPEATED_CHAR_REGEX = /(.)\1{3,}/u;

const BLOCKED_SPAM_WORDS = new Set(['test', 'asdf', 'abc', 'xyz', 'xxx', 'khac', 'khác', 'other', 'null', 'undefined']);

export interface CustomFileTypeValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

export function validateCustomFileTypeName(value: string | null | undefined): CustomFileTypeValidationResult {
  if (!value || !value.trim()) {
    return {
      isValid: false,
      error: 'Vui lòng nhập tên loại tài nguyên khi chọn loại "Khác".',
    };
  }

  const trimmed = value.trim();

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'Tên loại tài nguyên quá ngắn (tối thiểu 3 ký tự).',
    };
  }

  if (trimmed.length > 50) {
    return {
      isValid: false,
      error: 'Tên loại tài nguyên không được vượt quá 50 ký tự.',
    };
  }

  // Chặn thẻ HTML và các ký tự điều khiển/nguy hiểm
  if (!SAFE_CHARACTERS_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error:
        'Tên loại tài nguyên chứa ký tự không hợp lệ hoặc nguy hiểm. Chỉ cho phép chữ cái, chữ số, khoảng trắng và dấu (- , () , . , + , #).',
    };
  }

  // Đảm bảo có ít nhất 2 chữ cái để mang ngữ nghĩa danh từ
  const letters = trimmed.match(LETTER_COUNT_REGEX);
  if (!letters || letters.length < 2) {
    return {
      isValid: false,
      error: 'Tên loại tài nguyên phải có ý nghĩa và chứa ít nhất 2 chữ cái.',
    };
  }

  // Chống ký tự lặp vô nghĩa liên tiếp >= 4 lần (VD: aaaa, .....)
  if (REPEATED_CHAR_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Tên loại tài nguyên không được chứa ký tự lặp vô nghĩa liên tiếp.',
    };
  }

  // Chống các từ khóa rác / placeholder
  const normalizedWord = trimmed.toLowerCase();
  if (BLOCKED_SPAM_WORDS.has(normalizedWord)) {
    return {
      isValid: false,
      error: 'Vui lòng nhập tên loại tài nguyên cụ thể, không nhập từ khóa chung chung hoặc vô nghĩa.',
    };
  }

  // Chuẩn hóa khoảng trắng kép
  const sanitized = trimmed.replace(/\s+/g, ' ');

  return {
    isValid: true,
    sanitized,
  };
}
