import { SetMetadata } from "@nestjs/common";

/**
 * 需要的权限
 * @param role 权限名称
 */
export const RequirePermission = (permission: string) => SetMetadata('permission', permission);