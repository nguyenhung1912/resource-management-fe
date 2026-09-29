export function parseDate(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return Number.isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput !== 'string') return null;

  const trimmed = dateInput.trim();
  if (!trimmed) return null;

  const isDateTime = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(trimmed);
  const hasTimezone = /([zZ]|[+-]\d{2}(?::?\d{2})?)$/.test(trimmed);

  if (isDateTime && !hasTimezone) {
    const isoString = trimmed.includes(' ') ? trimmed.replace(' ', 'T') : trimmed;
    const parsedUtc = new Date(`${isoString}Z`);
    if (!Number.isNaN(parsedUtc.getTime())) {
      return parsedUtc;
    }
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  const date = parseDate(dateInput);
  if (!date) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) return 'Vừa xong';

  if (diffInSeconds < 60) return 'Vừa xong';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Hôm qua';

  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  // Định dạng ngày tháng năm chuẩn nếu quá 7 ngày
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  const date = parseDate(dateInput);
  if (!date) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
