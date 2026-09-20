import { Code2, Download, ExternalLink, Eye, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type { SourceCodeItem } from '@/features/digital-resources/source-code/types/source-code.types';
import { formatYearCompleted, getSourceCodeStatusBadge, isValidGithubUrl } from '../utils/sourceCodeUtils';

export interface SourceCodeTableProps {
  items: SourceCodeItem[];
  onSelect: (fileId: string) => void;
  onDownload: (fileId: string, fileName?: string) => void;
}

export function SourceCodeTable({ items, onSelect, onDownload }: SourceCodeTableProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface shadow-xs overflow-hidden">
      <Table aria-label="Bảng danh sách dự án mã nguồn">
        <TableHeader>
          <TableRow className="bg-gray-50/70">
            <TableHead className="font-semibold text-text-main py-3.5 pl-5">Dự án / Mã nguồn</TableHead>
            <TableHead className="font-semibold text-text-main">Học vụ</TableHead>
            <TableHead className="font-semibold text-text-main text-center">Năm</TableHead>
            <TableHead className="font-semibold text-text-main">Repository</TableHead>
            <TableHead className="font-semibold text-text-main text-center">Trạng thái</TableHead>
            <TableHead className="font-semibold text-text-main text-right pr-5">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => {
            const statusBadge = getSourceCodeStatusBadge(item.fileStatusId, item.fileStatusName);
            const hasGithub = isValidGithubUrl(item.githubLink);

            return (
              <TableRow
                key={item.fileId}
                className="hover:bg-gray-50/60 transition-colors cursor-pointer group"
                onClick={() => onSelect(item.fileId)}
              >
                {/* Project Name & Descripition */}
                <TableCell className="py-4 pl-5 max-w-xs sm:max-w-md">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Code2 className="size-4.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-semibold text-text-main truncate group-hover:text-primary transition-colors text-sm">
                        {item.fileName}
                      </span>
                      <p className="text-xs text-text-muted truncate mt-0.5">
                        {item.fileDescription || 'Dự án học liệu mã nguồn'}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Major & Course */}
                <TableCell className="text-xs">
                  <div className="space-y-1">
                    <span className="font-medium text-text-main block">{item.subMajorCode || 'Chung'}</span>
                    {item.courseCode ? (
                      <span className="text-text-muted text-[11px] block">{item.courseCode}</span>
                    ) : null}
                  </div>
                </TableCell>

                {/* Year of Completion */}
                <TableCell className="text-xs text-center font-medium text-text-main">
                  {formatYearCompleted(item.yearCompleted)}
                </TableCell>

                {/* Repository GitHub */}
                <TableCell className="text-xs" onClick={(e) => e.stopPropagation()}>
                  {hasGithub && item.githubLink ? (
                    <a
                      href={item.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-text-main hover:text-primary font-medium transition-colors"
                      aria-label={`Mở repository GitHub của ${item.fileName}`}
                    >
                      <GitBranch className="size-3.5 text-primary" aria-hidden="true" />
                      <span>GitHub</span>
                      <ExternalLink className="size-3 text-text-muted" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-text-muted italic text-[11px]">Không có</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <Badge variant={statusBadge.variant} className="font-medium">
                    {statusBadge.label}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right pr-5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelect(item.fileId)}
                      aria-label={`Xem chi tiết ${item.fileName}`}
                      className="h-8 px-2.5 text-xs text-text-muted hover:text-text-main"
                    >
                      <Eye className="size-3.5 mr-1" aria-hidden="true" />
                      Chi tiết
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(item.fileId, item.fileName)}
                      aria-label={`Tải mã nguồn ${item.fileName}`}
                      className="h-8 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/5"
                    >
                      <Download className="size-3.5 mr-1" aria-hidden="true" />
                      Tải về
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default SourceCodeTable;
