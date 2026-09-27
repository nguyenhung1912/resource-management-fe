import { useState } from 'react';
import { BookOpen, Building2, GraduationCap, LibraryBig } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { Tabs } from '@/components/ui/Tabs';

import { DepartmentsTab } from '../components/DepartmentsTab';
import { MajorsTab } from '../components/MajorsTab';
import { SubMajorsTab } from '../components/SubMajorsTab';
import { CoursesTab } from '../components/CoursesTab';

import type { AcademicTab, Department } from '../types/academic.types';

interface LoaderData {
  departments: Department[];
}

const academicTabs = [
  {
    id: 'departments',
    label: 'Khoa',
    icon: Building2,
  },
  {
    id: 'majors',
    label: 'Ngành học',
    icon: GraduationCap,
  },
  {
    id: 'submajors',
    label: 'Chuyên ngành',
    icon: LibraryBig,
  },
  {
    id: 'courses',
    label: 'Học phần',
    icon: BookOpen,
  },
] as const;

export function AcademicManagementPage() {
  const { departments } = useLoaderData() as LoaderData;

  const [activeTab, setActiveTab] = useState<AcademicTab>('departments');

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Quản lý học vụ"
        description="Quản lý khoa, ngành học, chuyên ngành và học phần trong hệ thống."
        icon={GraduationCap}
      />

      <Tabs<AcademicTab>
        items={academicTabs}
        activeValue={activeTab}
        onChange={setActiveTab}
        variant="segmented"
        ariaLabel="Danh mục quản lý học vụ"
      />

      {activeTab === 'departments' && <DepartmentsTab departments={departments} />}

      {activeTab === 'majors' && <MajorsTab departments={departments} />}

      {activeTab === 'submajors' && <SubMajorsTab departments={departments} />}

      {activeTab === 'courses' && <CoursesTab departments={departments} />}
    </div>
  );
}

export default AcademicManagementPage;
