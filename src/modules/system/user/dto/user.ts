import { SysDeptEntity } from '../../dept/entities/dept.entity';
import { SysRoleEntity } from '../../role/entities/role.entity';
import { UserEntity } from '../entities/user.entity';

export type UserType = {
  browser: string;
  ipaddr: string;
  loginLocation: string;
  loginTime: Date;
  os: string;
  permissions: string[];
  roles: any[];
  token: string;
  user: {
    dept: SysDeptEntity;
    roles: Array<SysRoleEntity>;
  } & UserEntity;
  userId: number;
  username: string;
  deptId: number;
};
