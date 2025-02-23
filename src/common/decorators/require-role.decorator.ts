import { SetMetadata } from "@nestjs/common";

/**
 * 需要的角色
 * @param role 角色名称
 */
export const RequireRole = (role: string) => SetMetadata('role', role);