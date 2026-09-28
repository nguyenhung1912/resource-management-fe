import { academicService } from '@/services/academicService';

export async function academicManagementLoader() {
  const departments = await academicService.getDepartments();

  return {
    departments,
  };
}
