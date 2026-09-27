import type { LoaderFunctionArgs } from 'react-router-dom';

import { adminAccountService } from '@/services/adminAccountService';
import { academicService } from '@/services/academicService';

export async function adminAccountsLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const search = url.searchParams.get('search') || undefined;

  const roleIdValue = url.searchParams.get('roleId');

  const statusValue = url.searchParams.get('isActive');

  const pageValue = url.searchParams.get('pageNumber');

  const pageNumber = Number(pageValue) > 0 ? Number(pageValue) : 1;

  const roleId = roleIdValue ? Number(roleIdValue) : undefined;

  const isActive = statusValue === 'true' ? true : statusValue === 'false' ? false : undefined;

  const [users, roles, departments] = await Promise.all([
    adminAccountService.getUsers({
      search,
      roleId,
      isActive,
      pageNumber,
      pageSize: 10,
    }),

    adminAccountService.getRoles(),
    academicService.getDepartments(),
  ]);

  return {
    users,
    roles,
    departments,
  };
}
