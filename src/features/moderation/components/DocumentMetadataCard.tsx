import { Building2, FileText, GraduationCap, Hash, Mail, User, Users } from 'lucide-react';
import type { ModerationResourceDetailResponse } from '../types/moderation.types';
import { cn } from '@/utils/cn';

export interface DocumentMetadataCardProps {
  document: ModerationResourceDetailResponse;
  className?: string;
}

export function DocumentMetadataCard({ document, className }: DocumentMetadataCardProps) {
  const uploader = document.uploader;
  const authors = document.authors ?? [];
  const uploaderInitials = uploader?.fullName
    ? uploader.fullName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className={cn('bg-surface rounded-2xl border border-border-subtle p-5 sm:p-6 space-y-6 shadow-xs', className)}>
      {/* Card Title */}
      <div className="flex items-center gap-3 border-b border-border-subtle/80 pb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-main">Hồ sơ Học thuật & Đăng ký</h2>
          <p className="text-xs text-text-muted">Thông tin phân loại chuyên ngành và quyền tác giả của tài liệu</p>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Khoa */}
        <div className="p-3.5 rounded-xl bg-background border border-border-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted font-medium">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Khoa phụ trách</span>
          </div>
          <p className="text-sm font-semibold text-text-main">{document.departmentName || 'Chưa cập nhật khoa'}</p>
        </div>

        {/* Chuyên ngành */}
        <div className="p-3.5 rounded-xl bg-background border border-border-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted font-medium">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Chuyên ngành đào tạo</span>
          </div>
          <p className="text-sm font-semibold text-text-main">
            {document.subMajorName || 'Chưa phân chuyên ngành'}
            {document.subMajorCode ? (
              <span className="ml-1.5 text-xs font-normal text-text-muted">({document.subMajorCode})</span>
            ) : null}
          </p>
        </div>

        {/* Loại tài liệu */}
        <div className="p-3.5 rounded-xl bg-background border border-border-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted font-medium">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Phân loại tài liệu</span>
          </div>
          <p className="text-sm font-semibold text-text-main">{document.fileTypeName || 'Tài liệu nghiên cứu'}</p>
        </div>

        {/* File ID */}
        <div className="p-3.5 rounded-xl bg-background border border-border-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted font-medium">
            <Hash className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mã định danh tài liệu</span>
          </div>
          <p className="text-sm font-mono font-medium text-text-main truncate" title={document.fileId}>
            {document.fileId}
          </p>
        </div>
      </div>

      {/* Uploader Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Người đăng tải tài liệu</h3>
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-background border border-border-subtle">
          <div className="size-10 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary/20">
            {uploaderInitials}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-text-main">{uploader?.fullName || 'Người dùng ẩn danh'}</span>
              {uploader?.uid && (
                <span className="text-[11px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border-subtle">
                  {uploader.uid}
                </span>
              )}
            </div>
            {uploader?.email && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{uploader.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authors List Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Danh sách tác giả ({authors.length})</span>
          </h3>
        </div>

        {authors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {authors.map((author, idx) => {
              const name = author.fullName || author.authorName || `Tác giả ${idx + 1}`;
              return (
                <div
                  key={author.authorId || idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background border border-border-subtle text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-surface border border-border-subtle text-text-muted shrink-0">
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-main truncate">{name}</p>
                    {author.email && <p className="text-[11px] text-text-muted truncate">{author.email}</p>}
                    {author.affiliation && <p className="text-[11px] text-text-muted truncate">{author.affiliation}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-text-muted italic p-3 rounded-lg bg-background border border-border-subtle">
            Chưa khai báo danh sách đồng tác giả.
          </p>
        )}
      </div>

      {/* Abstract / Description */}
      <div className="space-y-2 pt-1 border-t border-border-subtle/80">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Tóm tắt nội dung</h3>
        <div className="p-4 rounded-xl bg-background border border-border-subtle text-xs sm:text-sm text-text-main leading-relaxed">
          {document.fileDescription?.trim() ? (
            <p className="whitespace-pre-line text-text-main/90">{document.fileDescription}</p>
          ) : (
            <p className="text-text-muted italic">Tài liệu không có nội dung mô tả tóm tắt đính kèm.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentMetadataCard;
