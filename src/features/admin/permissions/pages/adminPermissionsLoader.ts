import type { LoaderFunctionArgs } from 'react-router-dom';

import { adminPermissionService } from '@/services/adminPermissionService';

export async function adminPermissionsLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const roleIdParam = Number(url.searchParams.get('roleId'));

  const [roles, functions] = await Promise.all([
    adminPermissionService.getRoles(),

    adminPermissionService.getFunctions(),
  ]);

  const selectedRoleId = roles.some((role) => role.roleId === roleIdParam) ? roleIdParam : roles[0]?.roleId;

  const role = selectedRoleId ? await adminPermissionService.getRoleFunctions(selectedRoleId) : null;

  return {
    roles,
    functions,
    role,
    selectedRoleId,
  };
}
