import { useMemo, useState } from 'react';
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';

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
import { CourseModal } from './CourseModal';

import type { Course, Department, Major, SubMajor } from '../types/academic.types';

interface CoursesTabProps {
  departments: Department[];
}

export function CoursesTab({ departments }: CoursesTabProps) {
  const [departmentId, setDepartmentId] = useState('');

  const [majors, setMajors] = useState<Major[]>([]);

  const [majorId, setMajorId] = useState('');

  const [subMajors, setSubMajors] = useState<SubMajor[]>([]);

  const [subMajorCode, setSubMajorCode] = useState('');

  const [courses, setCourses] = useState<Course[]>([]);

  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDepartmentChange = async (selectedDepartmentId: string) => {
    setDepartmentId(selectedDepartmentId);

    setMajorId('');
    setSubMajorCode('');
    setMajors([]);
    setSubMajors([]);
    setCourses([]);
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

  const handleMajorChange = async (selectedMajorId: string) => {
    setMajorId(selectedMajorId);

    setSubMajorCode('');
    setSubMajors([]);
    setCourses([]);
    setSearch('');
    setLoadError(null);

    if (!selectedMajorId) {
      return;
    }

    try {
      setIsLoading(true);

      const data = await academicService.getSubMajors(selectedMajorId);

      setSubMajors(data);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Không thể tải danh sách chuyên ngành.'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourses = async (selectedSubMajorCode: string) => {
    if (!selectedSubMajorCode) {
      setCourses([]);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const data = await academicService.getCourses(selectedSubMajorCode);

      setCourses(data);
    } catch (error) {
      setCourses([]);

      setLoadError(getApiErrorMessage(error, 'Không thể tải danh sách học phần.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubMajorChange = async (selectedSubMajorCode: string) => {
    setSubMajorCode(selectedSubMajorCode);

    setCourses([]);
    setSearch('');

    await loadCourses(selectedSubMajorCode);
  };

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return courses;
    }

    return courses.filter((course) => course.courseName.toLowerCase().includes(keyword));
  }, [courses, search]);

  const handleSuccess = async () => {
    setIsCreateOpen(false);
    setEditingCourse(null);

    await loadCourses(subMajorCode);
  };

  const handleDelete = async () => {
    if (!deletingCourse) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await academicService.deleteCourse(deletingCourse.courseCode);

      setDeletingCourse(null);

      await loadCourses(subMajorCode);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, 'Không thể xóa học phần.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-3 2xl:grid-cols-[210px_210px_210px_1fr_auto]">
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

          <Select
            value={subMajorCode}
            disabled={!majorId}
            onChange={(event) => {
              void handleSubMajorChange(event.target.value);
            }}
          >
            <option value="">-- Chọn chuyên ngành --</option>

            {subMajors.map((subMajor) => (
              <option key={subMajor.subMajorCode} value={subMajor.subMajorCode}>
                {subMajor.subMajorName}
              </option>
            ))}
          </Select>

          <Input
            value={search}
            disabled={!subMajorCode}
            iconLeft={<Search className="size-4" />}
            placeholder="Tìm học phần..."
            onChange={(event) => setSearch(event.target.value)}
          />

          <Button disabled={!subMajorCode} iconLeft={<Plus className="size-4" />} onClick={() => setIsCreateOpen(true)}>
            Thêm học phần
          </Button>
        </div>

        {loadError && <AlertBanner type="danger" message={loadError} />}

        {!departmentId ? (
          <EmptyState icon={BookOpen} title="Chọn khoa" description="Vui lòng chọn khoa trước." />
        ) : !majorId ? (
          <EmptyState icon={BookOpen} title="Chọn ngành học" description="Vui lòng chọn ngành học." />
        ) : !subMajorCode ? (
          <EmptyState
            icon={BookOpen}
            title="Chọn chuyên ngành"
            description="Vui lòng chọn chuyên ngành để xem học phần."
          />
        ) : isLoading ? (
          <div className="py-12 text-center text-sm text-text-muted">Đang tải học phần...</div>
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={search ? 'Không tìm thấy học phần' : 'Chưa có học phần'}
            description={search ? 'Không có học phần phù hợp.' : 'Chuyên ngành này chưa có học phần.'}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">STT</TableHead>

                <TableHead>Tên học phần</TableHead>

                <TableHead className="w-36 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCourses.map((course, index) => (
                <TableRow key={course.courseCode}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell className="font-medium">{course.courseName}</TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Sửa học phần"
                        onClick={() => setEditingCourse(course)}
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <Button
                        variant="danger-soft"
                        size="icon-sm"
                        aria-label="Xóa học phần"
                        onClick={() => {
                          setDeletingCourse(course);

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
          <CourseModal
            isOpen
            subMajors={subMajors}
            defaultSubMajorCode={subMajorCode}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={handleSuccess}
          />
        )}

        {editingCourse && (
          <CourseModal
            key={editingCourse.courseCode}
            isOpen
            course={editingCourse}
            subMajors={subMajors}
            onClose={() => setEditingCourse(null)}
            onSuccess={handleSuccess}
          />
        )}

        {deletingCourse && (
          <AcademicDeleteModal
            isOpen
            title="Xác nhận xóa học phần"
            itemName={deletingCourse.courseName}
            error={deleteError}
            isDeleting={isDeleting}
            onClose={() => {
              if (isDeleting) {
                return;
              }

              setDeletingCourse(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default CoursesTab;
