import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class PermissionGuard implements CanActivate{
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // 获取权限要求
    const requiredPermission = this.reflector.getAllAndOverride('permission', [
      context.getClass(),
      context.getHandler()
    ]);

    // 如果没有设置权限要求，则允许访问
    if (!requiredPermission) {
      return true;
    }

    console.log('req.user', req.user.permissions);
    // 检查用户是否存在
    if (!req.user || !req.user.permissions) {
      throw new UnauthorizedException('User not authenticated or missing permissions');
    }

    console.log('requiredPermission', requiredPermission);
    return this.hasPermission(requiredPermission, req.user.permissions);
  }

  /**
   * 检查用户是否含有权限
   * @param permission 
   * @param permissions 
   * @returns 
   */
  hasPermission(permission: string, permissions: string[]): boolean {
    const AllPermission = '*:*:*';
    return permissions.includes(AllPermission) || permissions.some((v) => v === permission);
  }
}