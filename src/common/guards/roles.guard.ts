import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // 获取路由上的角色要求(可能是字符串或字符串数组)
    const role = this.reflector.getAllAndOverride<string>('role', [
      context.getClass(),
      context.getHandler()
    ]);

    // 不需要鉴权
    if (!role) {
      return true;
    }

    // 转换为数组统一处理
    const requiredRoles = Array.isArray(role) ? role : [role];

    const userRoles = req.user.roles.map(role => role.roleKey);

    return this.hasRole(requiredRoles, userRoles);
  }

  /**
   * 检测用户是否拥有所需角色
   * @param requiredRoles 需要的角色列表
   * @param userRoles 用户拥有的角色列表
   * @returns 只要用户拥有其中一个所需角色即可返回true
   */
  hasRole(requiredRoles: string[], userRoles: string[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }
  
}