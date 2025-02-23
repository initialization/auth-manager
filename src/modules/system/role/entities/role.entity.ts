import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base';
import { SysUserWithRoleEntity } from '../../user/entities/user-width-role.entity';

@Entity('sys_role', {
  comment: '角色信息表',
})
export class SysRoleEntity extends BaseEntity {
  @ApiProperty({ type: String, description: '角色ID' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'role_id', comment: '角色ID' })
  public roleId: number;

  @Column({ type: 'varchar', name: 'role_name', length: 30, comment: '角色名称' })
  public roleName: string;

  @Column({ type: 'int', name: 'role_sort', default: 0, comment: '显示顺序' })
  public roleSort: number;

  @Column({ type: 'varchar', name: 'role_key', length: 100, comment: '角色权限字符串' })
  public roleKey: string;
}