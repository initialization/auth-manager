import { Module } from '@nestjs/common';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { DeptModule } from './dept/dept.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [UserModule, RoleModule, DeptModule, MenuModule],
})
export class SystemModule {}
