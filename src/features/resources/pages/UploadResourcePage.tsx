import { useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import { APP_PATHS } from '@/constants/path';
import { UploadResourceModal } from '@/features/resources/components/UploadResourceModal';
import { useUploadResource } from '@/features/resources/hooks/useUploadResource';
import type { UploadResourceLoaderData } from '@/features/resources/pages/uploadResourceLoader';
import type { SelectOption, UploadResourceFormValues } from '@/features/resources/types/resource.types';

export function UploadResourcePage() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { isSubmitting, apiError, uploadResource } = useUploadResource();
  const loaderData = useLoaderData() as UploadResourceLoaderData | undefined;

  const closeUpload = () => {
    void navigate(APP_PATHS.RESOURCES_MANAGER);
  };

  const finishUpload = () => {
    void navigate(APP_PATHS.RESOURCES_MANAGER, { state: { resourceUploadSucceeded: true } });
  };

  const handleSubmit = async (values: UploadResourceFormValues) => {
    let queued = false;
    const isUploaded = await uploadResource(values, (job) => {
      queued = true;
      void navigate(APP_PATHS.PROCESSING_JOB(job.jobId));
    });
    if (isUploaded) {
      if (queued) return;
      revalidator.revalidate();
      finishUpload();
    }
  };

  const rawFileTypes = loaderData?.fileTypes;
  const rawDepartments = loaderData?.departments;
  const rawMajors = loaderData?.majors;
  const rawSubMajors = loaderData?.subMajors;
  const rawCourses = loaderData?.courses;

  const fileTypes: SelectOption<number>[] = rawFileTypes?.length
    ? rawFileTypes.map((ft) => ({
        value: Number(ft.id),
        label: ft.name,
      }))
    : [];

  const departments: SelectOption<string>[] = rawDepartments?.length
    ? rawDepartments.map((d) => ({
        value: d.id,
        label: d.name,
      }))
    : [];

  const majors: SelectOption<string>[] = rawMajors?.length
    ? rawMajors.map((m) => ({
        value: m.majorId,
        label: m.majorName,
      }))
    : [];

  const subMajors: SelectOption<string>[] = rawSubMajors?.length
    ? rawSubMajors.map((sm) => ({
        value: sm.subMajorCode,
        label: `${sm.subMajorName} (${sm.subMajorCode})`,
      }))
    : [];

  const courses: SelectOption<string>[] = rawCourses?.length
    ? rawCourses.map((c) => ({
        value: c.courseCode,
        label: `${c.courseCode} - ${c.courseName}`,
      }))
    : [];

  return (
    <UploadResourceModal
      isOpen
      isSubmitting={isSubmitting}
      apiError={apiError}
      fileTypes={fileTypes}
      departments={departments}
      majors={majors}
      subMajors={subMajors}
      courses={courses}
      subMajorDetails={rawSubMajors}
      courseDetails={rawCourses}
      majorDetails={rawMajors}
      onClose={closeUpload}
      onSubmit={handleSubmit}
    />
  );
}

export default UploadResourcePage;
