import { useMemo, useState } from 'react';
import axios from 'axios';
import { GraduationCap, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { AlertBanner } from '@/components/common/AlertBanner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

import { academicService } from '@/services/academicService';

import { AcademicDeleteModal } from './AcademicDeleteModal';
import { MajorModal } from './MajorModal';

import type { Department, Major } from '../types/academic.types';

interface MajorsTabProps {
  departments: Department[];
}

export function MajorsTab({ departments }: MajorsTabProps) {
  const [departmentId, setDepartmentId] = useState('');

  const [majors, setMajors] = useState<Major[]>([]);

  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingMajor, setEditingMajor] = useState<Major | null>(null);

  const [deletingMajor, setDeletingMajor] = useState<Major | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadMajors = async (selectedDepartmentId: string) => {
    if (!selectedDepartmentId) {
      setMajors([]);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const data = await academicService.getMajors(selectedDepartmentId);

      setMajors(data);
    } catch (error) {
      console.error(error);

      setLoadError('Không thể tải danh sách ngành học.');

      setMajors([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDepartmentChange = async (selectedDepartmentId: string) => {
    setDepartmentId(selectedDepartmentId);
    setSearch('');

    if (!selectedDepartmentId) {
      setMajors([]);
      setLoadError(null);
      return;
    }

    await loadMajors(selectedDepartmentId);
  };

  const filteredMajors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return majors;
    }

    return majors.filter((major) => major.majorName.toLowerCase().includes(keyword));
  }, [majors, search]);

  const handleSuccess = async (message: string) => {
    setIsCreateOpen(false);
    setEditingMajor(null);

    setSuccessMessage(message);

    await loadMajors(departmentId);
  };

  const handleDelete = async () => {
    if (!deletingMajor) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await academicService.deleteMajor(deletingMajor.majorId);

      setDeletingMajor(null);

      setSuccessMessage('Xóa ngành học thành công.');
      await loadMajors(departmentId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setDeleteError(error.response.data?.message ?? 'Không thể xóa ngành vì vẫn còn chuyên ngành liên quan.');

        return;
      }

      setDeleteError('Không thể xóa ngành học.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-3 lg:grid-cols-[260px_1fr_auto]">
          <Select
            value={departmentId}
            onChange={(event) => {
              void handleDepartmentChange(event.target.value);
            }}
          >
            <option value="">-- Chọn khoa --</option>

            {departments.map((department) => (
              <option key={department.departmentId} value={department.departmentId}>
                {department.departmentName}
              </option>
            ))}
          </Select>

          <Input
            value={search}
            disabled={!departmentId}
            iconLeft={<Search className="size-4" />}
            placeholder="Tìm kiếm ngành học..."
            onChange={(event) => setSearch(event.target.value)}
          />

          <Button disabled={!departmentId} iconLeft={<Plus className="size-4" />} onClick={() => setIsCreateOpen(true)}>
            Thêm ngành
          </Button>
        </div>

        {loadError && <AlertBanner type="danger" message={loadError} />}
        {successMessage && (
          <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
        )}

        {!departmentId ? (
          <EmptyState
            icon={GraduationCap}
            title="Chọn khoa"
            description="Vui lòng chọn khoa để xem danh sách ngành học."
          />
        ) : isLoading ? (
          <div className="py-12 text-center text-sm text-text-muted">Đang tải danh sách ngành học...</div>
        ) : filteredMajors.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={search ? 'Không tìm thấy ngành học' : 'Chưa có ngành học'}
            description={
              search ? 'Không có ngành nào phù hợp với từ khóa tìm kiếm.' : 'Khoa này chưa có ngành học nào.'
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">STT</TableHead>

                  <TableHead>Tên ngành học</TableHead>

                  <TableHead className="w-36 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredMajors.map((major, index) => (
                  <TableRow key={major.majorId}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell className="font-medium">{major.majorName}</TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label="Sửa ngành"
                          onClick={() => setEditingMajor(major)}
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          variant="danger-soft"
                          size="icon-sm"
                          aria-label="Xóa ngành"
                          onClick={() => {
                            setDeletingMajor(major);

                            setDeleteError(null);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <p className="text-xs text-text-muted">
              Tổng cộng <span className="font-semibold text-text-main">{filteredMajors.length}</span> ngành học
            </p>
          </>
        )}

        {isCreateOpen && (
          <MajorModal
            isOpen
            departments={departments}
            defaultDepartmentId={departmentId}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={() => void handleSuccess('Thêm ngành học thành công.')}
          />
        )}

        {editingMajor && (
          <MajorModal
            key={editingMajor.majorId}
            isOpen
            major={editingMajor}
            departments={departments}
            onClose={() => setEditingMajor(null)}
            onSuccess={() => void handleSuccess('Cập nhật ngành học thành công.')}
          />
        )}

        {deletingMajor && (
          <AcademicDeleteModal
            isOpen
            title="Xác nhận xóa ngành học"
            itemName={deletingMajor.majorName}
            error={deleteError}
            isDeleting={isDeleting}
            onClose={() => {
              if (isDeleting) {
                return;
              }

              setDeletingMajor(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default MajorsTab;
