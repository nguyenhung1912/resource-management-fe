import { BookOpen, Code2, FileSpreadsheet, FileText, Filter, GraduationCap, Sparkles, UserSearch } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SearchTabConfig } from '../types/search.types';

export const SEARCH_TABS_CONFIG: SearchTabConfig[] = [
  {
    id: 'all',
    label: 'Tài liệu & Học liệu',
    icon: BookOpen,
    showCount: true,
  },
  {
    id: 'ai',
    label: 'Trợ lý AI (Semantic Search)',
    icon: Sparkles,
    badge: 'MỚI',
  },
  {
    id: 'advanced',
    label: 'Bộ lọc nâng cao',
    icon: Filter,
  },
  {
    id: 'authors',
    label: 'Tác giả & Giảng viên',
    icon: UserSearch,
  },
];

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Bài giảng': BookOpen,
  'Khóa luận tốt nghiệp': GraduationCap,
  'Báo cáo môn học': FileSpreadsheet,
  'Mã nguồn': Code2,
  'Tài liệu khác': FileText,
};

export const SEARCH_CATEGORIES = ['all', 'Bài giảng', 'Khóa luận tốt nghiệp', 'Báo cáo môn học', 'Mã nguồn'] as const;

export const FACULTY_OPTIONS = [
  { value: 'all', label: 'Tất cả khoa' },
  { value: 'Công nghệ Thông tin', label: 'Công nghệ Thông tin' },
  { value: 'Trí tuệ Nhân tạo', label: 'Trí tuệ Nhân tạo' },
  { value: 'Kỹ thuật Phần mềm', label: 'Kỹ thuật Phần mềm' },
  { value: 'Hệ thống Thông tin', label: 'Hệ thống Thông tin' },
] as const;

export const AI_SUGGESTIONS = [
  'Tìm các bài giảng mới nhất về Lập trình .NET',
  'Khóa luận tốt nghiệp ngành Trí tuệ Nhân tạo điểm 10',
  'Mã nguồn mẫu các dự án đồ án môn học Web SPA',
  'Tài liệu ôn tập môn Kiến trúc Phần mềm',
] as const;
