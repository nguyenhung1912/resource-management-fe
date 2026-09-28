export const MAX_COMMENT_LENGTH = 4000;

export function getCommentAuthorInitials(name?: string): string {
  if (!name?.trim()) return 'ND';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface RoleBadgeInfo {
  variant: 'primary' | 'neutral' | 'success' | 'warning' | 'danger';
  label: string;
}

export function getRoleBadgeInfo(role?: string): RoleBadgeInfo {
  const normalized = (role ?? '').trim().toLowerCase();

  if (normalized === 'admin' || normalized.includes('quản trị')) {
    return { variant: 'danger', label: 'Quản trị viên' };
  }
  if (normalized === 'lecturer' || normalized.includes('giảng viên')) {
    return { variant: 'primary', label: 'Giảng viên' };
  }
  if (normalized === 'moderator' || normalized.includes('kiểm duyệt')) {
    return { variant: 'warning', label: 'Kiểm duyệt viên' };
  }

  return { variant: 'neutral', label: 'Sinh viên' };
}
