import { useMemo, useState } from 'react';
import { Network, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { AlertBanner } from '@/components/common/AlertBanner';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

import { academicService } from '@/services/academicService';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';

import { AcademicDeleteModal } from './AcademicDeleteModal';
import { SubMajorModal } from './SubMajorModal';

import type { Department, Major, SubMajor } from '../types/academic.types';

interface SubMajorsTabProps {
  departments: Department[];
}

export function SubMajorsTab({ departments }: SubMajorsTabProps) {
  const [departmentId, setDepartmentId] = useState('');

  const [majors, setMajors] = useState<Major[]>([]);

  const [majorId, setMajorId] = useState('');

  const [subMajors, setSubMajors] = useState<SubMajor[]>([]);

  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingSubMajor, setEditingSubMajor] = useState<SubMajor | null>(null);

  const [deletingSubMajor, setDeletingSubMajor] = useState<SubMajor | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDepartmentChange = async (selectedDepartmentId: string) => {
    setDepartmentId(selectedDepartmentId);

    setMajorId('');
    setMajors([]);
    setSubMajors([]);
    setSearch('');
    setLoadError(null);

    if (!selectedDepartmentId) {
      return;
    }

    try {
      setIsLoading(true);

      const data = await academicService.getMajors(selectedDepartmentId);

      setMajors(data);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Không thể tải danh sách ngành học.'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubMajors = async (selectedMajorId: string) => {
    if (!selectedMajorId) {
      setSubMajors([]);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const data = await academicService.getSubMajors(selectedMajorId);

      setSubMajors(data);
    } catch (error) {
      setSubMajors([]);

      setLoadError(getApiErrorMessage(error, 'Không thể tải danh sách chuyên ngành.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMajorChange = async (selectedMajorId: string) => {
    setMajorId(selectedMajorId);
    setSubMajors([]);
    setSearch('');

    await loadSubMajors(selectedMajorId);
  };

  const filteredSubMajors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return subMajors;
    }

    return subMajors.filter((subMajor) => subMajor.subMajorName.toLowerCase().includes(keyword));
  }, [search, subMajors]);

  const handleSuccess = async (message: string) => {
    setIsCreateOpen(false);
    setEditingSubMajor(null);

    setSuccessMessage(message);

    await loadSubMajors(majorId);
  };

  const handleDelete = async () => {
    if (!deletingSubMajor) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await academicService.deleteSubMajor(deletingSubMajor.subMajorCode);

      setDeletingSubMajor(null);

      setSuccessMessage('Xóa chuyên ngành thành công.');

      await loadSubMajors(majorId);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'Không thể xóa chuyên ngành.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-3 xl:grid-cols-[240px_240px_1fr_auto]">
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

          <Select
            value={majorId}
            disabled={!departmentId}
            onChange={(event) => {
              void handleMajorChange(event.target.value);
            }}
          >
            <option value="">-- Chọn ngành --</option>

            {majors.map((major) => (
              <option key={major.majorId} value={major.majorId}>
                {major.majorName}
              </option>
            ))}
          </Select>

          <Input
            value={search}
            disabled={!majorId}
            iconLeft={<Search className="size-4" />}
            placeholder="Tìm chuyên ngành..."
            onChange={(event) => setSearch(event.target.value)}
          />

          <Button disabled={!majorId} iconLeft={<Plus className="size-4" />} onClick={() => setIsCreateOpen(true)}>
            Thêm chuyên ngành
          </Button>
        </div>

        {loadError && <AlertBanner type="danger" message={loadError} />}
        {successMessage && (
          <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
        )}

        {!departmentId ? (
          <EmptyState icon={Network} title="Chọn khoa" description="Vui lòng chọn khoa trước." />
        ) : !majorId ? (
          <EmptyState
            icon={Network}
            title="Chọn ngành học"
            description="Vui lòng chọn ngành để xem các chuyên ngành."
          />
        ) : isLoading ? (
          <div className="py-12 text-center text-sm text-text-muted">Đang tải chuyên ngành...</div>
        ) : filteredSubMajors.length === 0 ? (
          <EmptyState
            icon={Network}
            title={search ? 'Không tìm thấy chuyên ngành' : 'Chưa có chuyên ngành'}
            description={search ? 'Không có chuyên ngành phù hợp.' : 'Ngành này chưa có chuyên ngành.'}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">STT</TableHead>

                <TableHead>Tên chuyên ngành</TableHead>

                <TableHead className="w-36 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSubMajors.map((subMajor, index) => (
                <TableRow key={subMajor.subMajorCode}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell className="font-medium">{subMajor.subMajorName}</TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Sửa chuyên ngành"
                        onClick={() => setEditingSubMajor(subMajor)}
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <Button
                        variant="danger-soft"
                        size="icon-sm"
                        aria-label="Xóa chuyên ngành"
                        onClick={() => {
                          setDeletingSubMajor(subMajor);

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
        )}

        {isCreateOpen && (
          <SubMajorModal
            isOpen
            majors={majors}
            defaultMajorId={majorId}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={() => void handleSuccess('Thêm chuyên ngành thành công.')}
          />
        )}

        {editingSubMajor && (
          <SubMajorModal
            key={editingSubMajor.subMajorCode}
            isOpen
            majors={majors}
            subMajor={editingSubMajor}
            onClose={() => setEditingSubMajor(null)}
            onSuccess={() => void handleSuccess('Thêm chuyên ngành thành công.')}
          />
        )}

        {deletingSubMajor && (
          <AcademicDeleteModal
            isOpen
            title="Xác nhận xóa chuyên ngành"
            itemName={deletingSubMajor.subMajorName}
            error={deleteError}
            isDeleting={isDeleting}
            onClose={() => {
              if (isDeleting) {
                return;
              }

              setDeletingSubMajor(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default SubMajorsTab;
