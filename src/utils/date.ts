export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '';

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
