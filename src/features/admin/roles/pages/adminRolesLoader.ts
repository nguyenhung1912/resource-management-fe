import type { LoaderFunctionArgs } from 'react-router-dom';

import { adminAccountService } from '@/services/adminAccountService';
import { adminRoleService } from '@/services/adminRoleService';

export async function adminRolesLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const search = url.searchParams.get('search') ?? undefined;

  const roleIdValue = url.searchParams.get('roleId');

  const pageNumber = Number(url.searchParams.get('pageNumber') ?? 1);

  const roleId = roleIdValue ? Number(roleIdValue) : undefined;

  const [users, roles] = await Promise.all([
    adminAccountService.getUsers({
      search,
      roleId,
      pageNumber,
      pageSize: 10,
    }),

    adminRoleService.getRoles(),
  ]);

  return {
    users,
    roles,
  };
}
