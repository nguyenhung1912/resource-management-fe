export const MIN_COMPLETION_YEAR = 1900;

export function getMaxCompletionYear(): number {
  return new Date().getFullYear() + 1;
}

export interface YearValidationResult {
  isValid: boolean;
  error?: string;
  numericYear: number | null;
}

export function sanitizeYearInput(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.replace(/\D/g, '').slice(0, 4);
}

export function validateCompletionYear(
  value: string | null | undefined,
  isSubmitted = false,
  maxYear = getMaxCompletionYear(),
): YearValidationResult {
  if (!value || !value.trim()) {
    return {
      isValid: true,
      numericYear: null,
    };
  }

  const sanitized = sanitizeYearInput(value.trim());

  // Nếu người dùng đang nhập dở (1 đến 3 chữ số)
  if (sanitized.length < 4) {
    if (isSubmitted) {
      return {
        isValid: false,
        error: 'Năm hoàn thành phải đủ 4 chữ số (VD: 2024).',
        numericYear: null,
      };
    }

    // Đang gõ và chưa submit: chưa báo lỗi để người dùng hoàn tất nhập
    return {
      isValid: true,
      numericYear: null,
    };
  }

  const numeric = Number(sanitized);

  if (!Number.isInteger(numeric) || numeric < MIN_COMPLETION_YEAR || numeric > maxYear) {
    return {
      isValid: false,
      error: `Năm hoàn thành phải nằm trong khoảng ${MIN_COMPLETION_YEAR}–${maxYear}.`,
      numericYear: null,
    };
  }

  return {
    isValid: true,
    numericYear: numeric,
  };
}
