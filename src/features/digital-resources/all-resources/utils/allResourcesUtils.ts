export function formatFileSize(bytes?: number | null): string {
  if (bytes === undefined || bytes === null || bytes <= 0) {
    return '';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getFileTypeBadgeClass(fileTypeName?: string | null): string {
  const normalized = (fileTypeName || '').toLowerCase();
  if (/bài giảng|giáo trình/i.test(normalized)) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (/khóa luận|luận văn/i.test(normalized)) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (/báo cáo|đề tài/i.test(normalized)) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (/mã nguồn|source\s*code/i.test(normalized)) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
}
