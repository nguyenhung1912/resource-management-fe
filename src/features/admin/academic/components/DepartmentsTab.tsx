import { useMemo, useState } from 'react';
import axios from 'axios';
import { Building2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useRevalidator } from 'react-router-dom';

import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

import { academicService } from '@/services/academicService';

import { AcademicDeleteModal } from './AcademicDeleteModal';
import { DepartmentModal } from './DepartmentModal';

import type { Department } from '../types/academic.types';

interface DepartmentsTabProps {
  departments: Department[];
}

export function DepartmentsTab({ departments }: DepartmentsTabProps) {
  const revalidator = useRevalidator();

  const [search, setSearch] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const filteredDepartments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return departments;
    }

    return departments.filter((department) => department.departmentName.toLowerCase().includes(keyword));
  }, [departments, search]);

  const handleSuccess = () => {
    setIsCreateOpen(false);
    setEditingDepartment(null);

    revalidator.revalidate();
  };

  const handleDelete = async () => {
    if (!deletingDepartment) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await academicService.deleteDepartment(deletingDepartment.departmentId);

      setDeletingDepartment(null);

      revalidator.revalidate();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setDeleteError(error.response.data?.message ?? 'Không thể xóa khoa vì vẫn còn ngành liên quan.');

        return;
      }

      setDeleteError('Không thể xóa khoa. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setDeletingDepartment(null);
    setDeleteError(null);
  };

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              value={search}
              iconLeft={<Search className="size-4" />}
              placeholder="Tìm kiếm khoa..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Button iconLeft={<Plus className="size-4" />} onClick={() => setIsCreateOpen(true)}>
            Thêm khoa
          </Button>
        </div>

        {filteredDepartments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={search ? 'Không tìm thấy khoa' : 'Chưa có khoa nào'}
            description={
              search ? 'Không có khoa nào phù hợp với từ khóa tìm kiếm.' : 'Thêm khoa mới để bắt đầu quản lý học vụ.'
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">STT</TableHead>

                  <TableHead>Tên khoa</TableHead>

                  <TableHead className="w-36 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredDepartments.map((department, index) => (
                  <TableRow key={department.departmentId}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell className="font-medium">{department.departmentName}</TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label="Sửa khoa"
                          onClick={() => setEditingDepartment(department)}
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          variant="danger-soft"
                          size="icon-sm"
                          aria-label="Xóa khoa"
                          onClick={() => {
                            setDeletingDepartment(department);

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
              Tổng cộng <span className="font-semibold text-text-main">{filteredDepartments.length}</span> khoa
            </p>
          </>
        )}

        {isCreateOpen && <DepartmentModal isOpen onClose={() => setIsCreateOpen(false)} onSuccess={handleSuccess} />}

        {editingDepartment && (
          <DepartmentModal
            key={editingDepartment.departmentId}
            isOpen
            department={editingDepartment}
            onClose={() => setEditingDepartment(null)}
            onSuccess={handleSuccess}
          />
        )}

        {deletingDepartment && (
          <AcademicDeleteModal
            isOpen
            title="Xác nhận xóa khoa"
            itemName={deletingDepartment.departmentName}
            error={deleteError}
            isDeleting={isDeleting}
            onClose={closeDeleteModal}
            onConfirm={handleDelete}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default DepartmentsTab;
