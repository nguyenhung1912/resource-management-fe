import { BookOpen, Code2, FileSpreadsheet, FileText, Filter, GraduationCap, Sparkles, UserSearch } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AuthorItem, MockResourceItem, SearchTabConfig } from '../types/search.types';

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

export const MOCK_RESOURCES: MockResourceItem[] = [
  {
    id: 'res-1',
    title: 'Giáo trình Lập trình Hướng đối tượng và Kiến trúc .NET Core',
    category: 'Bài giảng',
    author: 'TS. Nguyễn Văn Hùng',
    faculty: 'Công nghệ Thông tin',
    year: '2025',
    format: 'PDF',
    downloads: 342,
  },
  {
    id: 'res-2',
    title: 'Nghiên cứu ứng dụng Deep Learning trong phát hiện gian lận học thuật',
    category: 'Khóa luận tốt nghiệp',
    author: 'Lê Hoàng Nam (K44)',
    faculty: 'Trí tuệ Nhân tạo',
    year: '2025',
    format: 'PDF',
    downloads: 512,
  },
  {
    id: 'res-3',
    title: 'Mã nguồn hệ thống quản lý tài nguyên học liệu số trường đại học',
    category: 'Mã nguồn',
    author: 'Nhóm nghiên cứu phần mềm',
    faculty: 'Kỹ thuật Phần mềm',
    year: '2026',
    format: 'ZIP',
    downloads: 189,
  },
  {
    id: 'res-4',
    title: 'Báo cáo đồ án môn học Phân tích và Thiết kế Hệ thống Thông tin',
    category: 'Báo cáo môn học',
    author: 'Trần Thị Mai (K45)',
    faculty: 'Hệ thống Thông tin',
    year: '2025',
    format: 'DOCX',
    downloads: 267,
  },
];

export const AI_SUGGESTIONS = [
  'Tìm các bài giảng mới nhất về Lập trình .NET',
  'Khóa luận tốt nghiệp ngành Trí tuệ Nhân tạo điểm 10',
  'Mã nguồn mẫu các dự án đồ án môn học Web SPA',
  'Tài liệu ôn tập môn Kiến trúc Phần mềm',
] as const;

export const MOCK_AUTHORS: AuthorItem[] = [
  { name: 'TS. Nguyễn Văn Hùng', role: 'Giảng viên chính', dept: 'Khoa CNTT', count: 24 },
  { name: 'PGS. TS. Trần Minh Tuấn', role: 'Trưởng bộ môn AI', dept: 'Khoa CNTT', count: 42 },
  { name: 'ThS. Lê Hoàng Yến', role: 'Giảng viên', dept: 'Kỹ thuật Phần mềm', count: 18 },
] as const;
